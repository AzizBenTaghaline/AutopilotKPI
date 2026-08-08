from datetime import datetime, timezone

from app.models.enums import Periodicity
from app.models.kpi import Kpi
from app.models.kpi_entry import KpiEntry
from app.models.user import User
from app.schemas.dashboard import DashboardItem
from app.core.permissions import allowed_module_for

def _current_period(periodicity: Periodicity) -> str | None:
    now = datetime.now(timezone.utc)

    if periodicity == Periodicity.MONTHLY:
        return now.strftime("%Y-%m")
    if periodicity == Periodicity.WEEKLY:
        iso_year, iso_week, _ = now.isocalendar()
        return f"{iso_year}-W{iso_week:02d}"
    if periodicity == Periodicity.DAILY:
        return now.strftime("%Y-%m-%d")
    return None


class DashboardService:
    @staticmethod
    async def get_dashboard(current_user: User) -> list[DashboardItem]:
        allowed_module = allowed_module_for(current_user)

        kpi_query = (
            Kpi.find(Kpi.is_active == True)
            if allowed_module is None
            else Kpi.find(Kpi.is_active == True, Kpi.module == allowed_module)
        )
        kpis = await kpi_query.to_list()

        items = []
        for kpi in kpis:
            period = _current_period(kpi.periodicity)

            entry_query = (
                KpiEntry.find(KpiEntry.kpi_id == str(kpi.id), KpiEntry.period == period)
                if period is not None
                else KpiEntry.find(KpiEntry.kpi_id == str(kpi.id))
            )
            latest_entries = await entry_query.sort(-KpiEntry.submitted_at).limit(1).to_list()
            latest = latest_entries[0] if latest_entries else None

            items.append(
                DashboardItem(
                    kpi_id=str(kpi.id),
                    kpi_code=kpi.code,
                    kpi_name=kpi.name,
                    module=kpi.module,
                    unit=kpi.unit,
                    period=period or (latest.period if latest else None),
                    target_value=kpi.target_value,
                    current_value=latest.value if latest else None,
                    has_entry=latest is not None,
                )
            )

        return items