from datetime import datetime, timezone

from beanie import Document


class AuditLog(Document):


    action: str 
    entity_type: str  
    entity_id: str

    performed_by: str  
    performed_by_email: str  

    details: dict | None = None

    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "audit_logs"