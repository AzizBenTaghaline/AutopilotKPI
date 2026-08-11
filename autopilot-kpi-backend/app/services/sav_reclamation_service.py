from fastapi import HTTPException, status

from app.models.enums import ReclamationStatut
from app.models.sav_reclamation import SavReclamation
from app.models.user import User
from app.schemas.sav_reclamation import SavReclamationCreate, SavReclamationResponse
from app.services.audit_log_service import AuditLogService


def _to_response(r: SavReclamation) -> SavReclamationResponse:
    return SavReclamationResponse(
        id=str(r.id),
        client=r.client,
        cause=r.cause,
        statut=r.statut,
        date_reclamation=r.date_reclamation,
        created_by=r.created_by,
        created_at=r.created_at,
    )


class SavReclamationService:
    @staticmethod
    async def create(data: SavReclamationCreate, current_user: User) -> SavReclamationResponse:
        reclamation = SavReclamation(**data.model_dump(), created_by=str(current_user.id))
        await reclamation.insert()

        await AuditLogService.log(
            action="sav_reclamation_created",
            entity_type="SavReclamation",
            entity_id=str(reclamation.id),
            performed_by=current_user,
            details={"client": reclamation.client},
        )
        return _to_response(reclamation)

    @staticmethod
    async def list_all(statut: ReclamationStatut | None = None) -> list[SavReclamationResponse]:
        query = (
            SavReclamation.find_all()
            if statut is None
            else SavReclamation.find(SavReclamation.statut == statut)
        )
        reclamations = await query.sort(-SavReclamation.created_at).to_list()
        return [_to_response(r) for r in reclamations]

    @staticmethod
    async def resolve(reclamation_id: str, current_user: User) -> SavReclamationResponse:
        reclamation = await SavReclamation.get(reclamation_id)
        if not reclamation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Réclamation introuvable")

        reclamation.resolve() 
        await reclamation.save()

        await AuditLogService.log(
            action="sav_reclamation_resolved",
            entity_type="SavReclamation",
            entity_id=str(reclamation.id),
            performed_by=current_user,
        )
        return _to_response(reclamation)