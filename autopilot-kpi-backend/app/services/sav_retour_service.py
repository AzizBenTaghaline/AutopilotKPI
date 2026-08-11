from fastapi import HTTPException, status

from app.models.sav_retour import SavRetour
from app.models.user import User
from app.schemas.sav_retour import SavRetourCreate, SavRetourResponse
from app.services.audit_log_service import AuditLogService


def _to_response(r: SavRetour) -> SavRetourResponse:
    return SavRetourResponse(
        id=str(r.id),
        client=r.client,
        cause=r.cause,
        reparation_origine=r.reparation_origine,
        cloture=r.cloture,
        date_retour=r.date_retour,
        created_by=r.created_by,
        created_at=r.created_at,
    )


class SavRetourService:
    @staticmethod
    async def create(data: SavRetourCreate, current_user: User) -> SavRetourResponse:
        retour = SavRetour(**data.model_dump(), created_by=str(current_user.id))
        await retour.insert()

        await AuditLogService.log(
            action="sav_retour_created",
            entity_type="SavRetour",
            entity_id=str(retour.id),
            performed_by=current_user,
            details={"client": retour.client},
        )
        return _to_response(retour)

    @staticmethod
    async def list_all(cloture: bool | None = None) -> list[SavRetourResponse]:
        query = SavRetour.find_all() if cloture is None else SavRetour.find(SavRetour.cloture == cloture)
        retours = await query.sort(-SavRetour.created_at).to_list()
        return [_to_response(r) for r in retours]

    @staticmethod
    async def cloturer(retour_id: str, current_user: User) -> SavRetourResponse:
        retour = await SavRetour.get(retour_id)
        if not retour:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Retour introuvable")

        retour.cloturer() 
        await retour.save()

        await AuditLogService.log(
            action="sav_retour_cloture",
            entity_type="SavRetour",
            entity_id=str(retour.id),
            performed_by=current_user,
        )
        return _to_response(retour)