from app.models.enums import KpiModule, UserRole
from app.models.user import User


def allowed_module_for(current_user: User) -> KpiModule | None:
    if current_user.role == UserRole.COMMERCIAL:
        return KpiModule.COMMERCIAL
    if current_user.role == UserRole.CHEF_ATELIER:
        return KpiModule.SAV
    return None