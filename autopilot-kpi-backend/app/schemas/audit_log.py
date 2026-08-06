from datetime import datetime

from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: str
    performed_by: str
    performed_by_email: str
    details: dict | None
    created_at: datetime