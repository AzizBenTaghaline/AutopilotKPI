from datetime import datetime, timezone
from app.models.user import User
from fastapi import HTTPException, status

from app.models.enums import KpiModule, UserRole
from app.models.kpi import Kpi
from app.schemas.kpi import KpiCreate, KpiResponse, KpiUpdate
from app.models.user import User
from app.services.audit_log_service import AuditLogService

def _to_response(kpi: Kpi) -> KpiResponse:
    return KpiResponse(
        id=str(kpi.id),
        code=kpi.code,
        name=kpi.name,
        description=kpi.description,
        module=kpi.module,
        periodicity=kpi.periodicity,
        unit=kpi.unit,
        target_value=kpi.target_value,
        direction=kpi.direction,
        is_active=kpi.is_active,
        created_by=kpi.created_by,
        created_at=kpi.created_at,
    )


class KpiService:
    @staticmethod
    async def create_kpi(data: KpiCreate, current_user: User) -> KpiResponse:
        existing = await Kpi.find_one(Kpi.code == data.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Un KPI avec le code {data.code} existe déjà",
            )

        kpi = Kpi(**data.model_dump(), created_by=str(current_user.id))
        await kpi.insert()

        await AuditLogService.log(
            action="kpi_created",
            entity_type="Kpi",
            entity_id=str(kpi.id),
            performed_by=current_user,
            details={"code": kpi.code, "module": kpi.module.value},
        )

        return _to_response(kpi)

    @staticmethod
    async def list_kpis(module: KpiModule | None, current_user: User) -> list[KpiResponse]:
       
        if current_user.role == UserRole.COMMERCIAL:
            module = KpiModule.COMMERCIAL
        elif current_user.role == UserRole.CHEF_ATELIER:
            module = KpiModule.SAV
        query = Kpi.find_all() if module is None else Kpi.find(Kpi.module == module)
        kpis = await query.to_list()
        return [_to_response(k) for k in kpis]

    @staticmethod
    async def get_kpi(kpi_id: str, current_user: User) -> KpiResponse:
        kpi = await Kpi.get(kpi_id)
        if not kpi:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI introuvable")

        if current_user.role == UserRole.COMMERCIAL and kpi.module != KpiModule.COMMERCIAL:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé à ce KPI")
        if current_user.role == UserRole.CHEF_ATELIER and kpi.module != KpiModule.SAV:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé à ce KPI")

        return _to_response(kpi)
    @staticmethod
    async def update_kpi(kpi_id: str, data: KpiUpdate, current_user: User) -> KpiResponse:
        kpi = await Kpi.get(kpi_id)
        if not kpi:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI introuvable")

        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(kpi, field, value)
        kpi.updated_at = datetime.now(timezone.utc)

        await kpi.save()

        await AuditLogService.log(
            action="kpi_updated",
            entity_type="Kpi",
            entity_id=str(kpi.id),
            performed_by=current_user,
            details=updates,
        )

        return _to_response(kpi)

    @staticmethod
    async def delete_kpi(kpi_id: str, current_user: User) -> None:
        kpi = await Kpi.get(kpi_id)
        if not kpi:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI introuvable")

        await AuditLogService.log(
            action="kpi_deleted",
            entity_type="Kpi",
            entity_id=str(kpi.id),
            performed_by=current_user,
            details={"code": kpi.code},
        )

        await kpi.delete()