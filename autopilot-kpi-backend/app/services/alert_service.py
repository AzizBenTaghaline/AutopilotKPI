from app.models.alert import Alert
from app.models.enums import KpiDirection
from app.models.kpi import Kpi
from app.models.kpi_entry import KpiEntry
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.core.permissions import allowed_module_for

class AlertService:
    @staticmethod
    async def check_and_create_alert(kpi: Kpi, entry: KpiEntry) -> None:
        if kpi.target_value is None or kpi.direction is None:
            return

        missed = (
            entry.value < kpi.target_value
            if kpi.direction == KpiDirection.HIGHER_IS_BETTER
            else entry.value > kpi.target_value
        )
        if not missed:
            return

        await Alert(
            kpi_id=str(kpi.id),
            kpi_code=kpi.code,
            kpi_name=kpi.name,
            module=kpi.module,
            entry_id=str(entry.id),
            period=entry.period,
            target_value=kpi.target_value,
            actual_value=entry.value,
        ).insert()

    @staticmethod
    async def list_alerts(current_user: User) -> list[AlertResponse]:
        allowed_module = allowed_module_for(current_user)

        query = (
            Alert.find_all()
            if allowed_module is None
            else Alert.find(Alert.module == allowed_module)
        )
        alerts = await query.sort(-Alert.created_at).to_list()

        return [
            AlertResponse(
                id=str(a.id),
                kpi_id=a.kpi_id,
                kpi_code=a.kpi_code,
                kpi_name=a.kpi_name,
                module=a.module,
                entry_id=a.entry_id,
                period=a.period,
                target_value=a.target_value,
                actual_value=a.actual_value,
                created_at=a.created_at,
            )
            for a in alerts
        ]