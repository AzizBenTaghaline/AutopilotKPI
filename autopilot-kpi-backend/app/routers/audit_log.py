from fastapi import APIRouter, Depends

from app.models.enums import UserRole
from app.core.dependencies import require_role
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_log_service import AuditLogService

router = APIRouter(prefix="/audit-logs", tags=["Audit"])


@router.get(
    "",
    response_model=list[AuditLogResponse],
    dependencies=[Depends(require_role(UserRole.ADMINISTRATEUR))],
)
async def list_audit_logs(limit: int = 100):
    return await AuditLogService.list_logs(limit)