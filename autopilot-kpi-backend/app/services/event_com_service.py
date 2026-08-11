from app.models.event_com import EventCom
from app.models.user import User
from app.schemas.event_com import EventComCreate, EventComResponse, EventComStats
from app.services.audit_log_service import AuditLogService


def _to_response(e: EventCom) -> EventComResponse:
    return EventComResponse(
        id=str(e.id),
        titre=e.titre,
        lieu=e.lieu,
        date_evenement=e.date_evenement,
        nb_participants=e.nb_participants,
        created_by=e.created_by,
        created_at=e.created_at,
    )


class EventComService:
    @staticmethod
    async def create(data: EventComCreate, current_user: User) -> EventComResponse:
        event = EventCom(**data.model_dump(), created_by=str(current_user.id))
        await event.insert()

        await AuditLogService.log(
            action="event_com_created",
            entity_type="EventCom",
            entity_id=str(event.id),
            performed_by=current_user,
            details={"titre": event.titre},
        )
        return _to_response(event)

    @staticmethod
    async def list_all() -> list[EventComResponse]:
        events = await EventCom.find_all().sort(-EventCom.date_evenement).to_list()
        return [_to_response(e) for e in events]

    @staticmethod
    async def get_stats() -> EventComStats:
        """Correspond à getStats() du diagramme de classes."""
        events = await EventCom.find_all().to_list()
        total = len(events)
        total_participants = sum(e.nb_participants for e in events)
        moyenne = total_participants / total if total > 0 else 0.0

        return EventComStats(
            total_evenements=total,
            total_participants=total_participants,
            moyenne_participants=round(moyenne, 2),
        )