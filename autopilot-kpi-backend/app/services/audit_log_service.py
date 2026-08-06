from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse


class AuditLogService:
    @staticmethod
    async def log(
        action: str,
        entity_type: str,
        entity_id: str,
        performed_by: User,
        details: dict | None = None,
    ) -> None:
        await AuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            performed_by=str(performed_by.id),
            performed_by_email=performed_by.email,
            details=details,
        ).insert()

    @staticmethod
    async def list_logs(limit: int = 100) -> list[AuditLogResponse]:
        logs = await AuditLog.find_all().sort(-AuditLog.created_at).limit(limit).to_list()
        return [
            AuditLogResponse(
                id=str(log.id),
                action=log.action,
                entity_type=log.entity_type,
                entity_id=log.entity_id,
                performed_by=log.performed_by,
                performed_by_email=log.performed_by_email,
                details=log.details,
                created_at=log.created_at,
            )
            for log in logs
        ]