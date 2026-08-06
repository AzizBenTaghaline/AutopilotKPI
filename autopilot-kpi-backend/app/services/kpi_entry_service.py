from fastapi import HTTPException, status

from app.models.enums import KpiModule, UserRole
from app.models.kpi import Kpi
from app.models.kpi_entry import KpiEntry
from app.models.user import User
from app.services.audit_log_service import AuditLogService
from app.schemas.kpi_entry import KpiEntryCreate, KpiEntryResponse


def _allowed_module_for(current_user: User) -> KpiModule | None:
    if current_user.role == UserRole.COMMERCIAL:
        return KpiModule.COMMERCIAL
    if current_user.role == UserRole.CHEF_ATELIER:
        return KpiModule.SAV
    return None


async def _to_response(entry: KpiEntry, kpi: Kpi | None = None) -> KpiEntryResponse:
    if kpi is None:
        kpi = await Kpi.get(entry.kpi_id)
    return KpiEntryResponse(
        id=str(entry.id),
        kpi_id=entry.kpi_id,
        kpi_code=kpi.code,
        kpi_name=kpi.name,
        value=entry.value,
        period=entry.period,
        comment=entry.comment,
        submitted_by=entry.submitted_by,
        submitted_at=entry.submitted_at,
    )


class KpiEntryService:
    @staticmethod
    async def create_entry(data: KpiEntryCreate, current_user: User) -> KpiEntryResponse:
        kpi = await Kpi.get(data.kpi_id)
        if not kpi or not kpi.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KPI introuvable ou inactif",
            )

        allowed_module = _allowed_module_for(current_user)
        if allowed_module is not None and kpi.module != allowed_module:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez saisir que les KPI de votre module",
            )

        entry = KpiEntry(
            kpi_id=data.kpi_id,
            value=data.value,
            period=data.period,
            comment=data.comment,
            submitted_by=str(current_user.id),
        )
        await entry.insert()
        await AuditLogService.log(
            action="kpi_entry_created",
            entity_type="KpiEntry",
            entity_id=str(entry.id),
            performed_by=current_user,
            details={"kpi_code": kpi.code, "period": entry.period, "value": entry.value},
        )
        return await _to_response(entry, kpi)

    @staticmethod
    async def list_entries(
        current_user: User,
        kpi_id: str | None = None,
        period: str | None = None,
    ) -> list[KpiEntryResponse]:
        allowed_module = _allowed_module_for(current_user)
        kpi_query = Kpi.find_all() if allowed_module is None else Kpi.find(Kpi.module == allowed_module)
        visible_kpis = {str(k.id): k for k in await kpi_query.to_list()}

        if kpi_id is not None:
            if kpi_id not in visible_kpis:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé à ce KPI")
            entry_query = KpiEntry.find(KpiEntry.kpi_id == kpi_id)
        else:
            entry_query = KpiEntry.find(KpiEntry.kpi_id.in_(list(visible_kpis.keys())))

        if period is not None:
            entry_query = entry_query.find(KpiEntry.period == period)

        entries = await entry_query.sort(-KpiEntry.submitted_at).to_list()

        return [
            await _to_response(e, visible_kpis.get(e.kpi_id))
            for e in entries
        ]