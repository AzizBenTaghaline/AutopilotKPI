from app.models.satisfaction_client import SatisfactionClient
from app.models.user import User
from app.schemas.satisfaction_client import SatisfactionClientCreate, SatisfactionClientResponse, SatisfactionStats
from app.services.audit_log_service import AuditLogService


def _to_response(s: SatisfactionClient) -> SatisfactionClientResponse:
    return SatisfactionClientResponse(
        id=str(s.id),
        client=s.client,
        note=s.note,
        date_saisie=s.date_saisie,
        created_by=s.created_by,
        created_at=s.created_at,
    )


class SatisfactionClientService:
    @staticmethod
    async def create(data: SatisfactionClientCreate, current_user: User) -> SatisfactionClientResponse:
        satisfaction = SatisfactionClient(**data.model_dump(), created_by=str(current_user.id))
        await satisfaction.insert()

        await AuditLogService.log(
            action="satisfaction_created",
            entity_type="SatisfactionClient",
            entity_id=str(satisfaction.id),
            performed_by=current_user,
            details={"client": satisfaction.client, "note": satisfaction.note},
        )
        return _to_response(satisfaction)

    @staticmethod
    async def list_all() -> list[SatisfactionClientResponse]:
        items = await SatisfactionClient.find_all().sort(-SatisfactionClient.created_at).to_list()
        return [_to_response(s) for s in items]

    @staticmethod
    async def get_stats() -> SatisfactionStats:
        items = await SatisfactionClient.find_all().to_list()
        if not items:
            return SatisfactionStats(moyenne=0.0, nb_saisies=0)

        moyenne = sum(i.note for i in items) / len(items)
        return SatisfactionStats(moyenne=round(moyenne, 1), nb_saisies=len(items))