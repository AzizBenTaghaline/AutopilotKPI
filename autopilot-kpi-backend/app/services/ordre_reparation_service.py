from fastapi import HTTPException, status

from app.models.enums import OrdreReparationStatut
from app.models.ordre_reparation import OrdreReparation
from app.models.user import User
from app.schemas.ordre_reparation import OrdreReparationCreate, OrdreReparationResponse, OrdreReparationStats
from app.services.audit_log_service import AuditLogService


def _to_response(o: OrdreReparation) -> OrdreReparationResponse:
    return OrdreReparationResponse(
        id=str(o.id),
        client=o.client,
        statut=o.statut,
        sous_garantie=o.sous_garantie,
        montant=o.montant,
        date_or=o.date_or,
        created_by=o.created_by,
        created_at=o.created_at,
    )


class OrdreReparationService:
    @staticmethod
    async def create(data: OrdreReparationCreate, current_user: User) -> OrdreReparationResponse:
        ordre = OrdreReparation(**data.model_dump(), created_by=str(current_user.id))
        await ordre.insert()

        await AuditLogService.log(
            action="ordre_reparation_created",
            entity_type="OrdreReparation",
            entity_id=str(ordre.id),
            performed_by=current_user,
            details={"client": ordre.client, "montant": ordre.montant},
        )
        return _to_response(ordre)

    @staticmethod
    async def list_all(statut: OrdreReparationStatut | None = None) -> list[OrdreReparationResponse]:
        query = (
            OrdreReparation.find_all()
            if statut is None
            else OrdreReparation.find(OrdreReparation.statut == statut)
        )
        ordres = await query.sort(-OrdreReparation.created_at).to_list()
        return [_to_response(o) for o in ordres]

    @staticmethod
    async def facturer(ordre_id: str, current_user: User) -> OrdreReparationResponse:
        ordre = await OrdreReparation.get(ordre_id)
        if not ordre:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ordre de réparation introuvable")

        ordre.statut = OrdreReparationStatut.FACTURE
        await ordre.save()

        await AuditLogService.log(
            action="ordre_reparation_factured",
            entity_type="OrdreReparation",
            entity_id=str(ordre.id),
            performed_by=current_user,
        )
        return _to_response(ordre)

    @staticmethod
    async def get_stats() -> OrdreReparationStats:
        ordres = await OrdreReparation.find_all().to_list()
        return OrdreReparationStats(
            total=len(ordres),
            ouverts=sum(1 for o in ordres if o.statut == OrdreReparationStatut.NON_FACTURE),
            factures=sum(1 for o in ordres if o.statut == OrdreReparationStatut.FACTURE),
            sous_garantie=sum(1 for o in ordres if o.sous_garantie),
        )