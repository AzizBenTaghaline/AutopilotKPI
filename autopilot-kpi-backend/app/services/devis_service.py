from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.models.devis import Devis
from app.models.enums import DevisStatut, UserRole
from app.models.user import User
from app.schemas.devis import DevisCreate, DevisResponse, DevisStatutUpdate, RankingEntry
from app.services.audit_log_service import AuditLogService


def _to_response(d: Devis) -> DevisResponse:
    return DevisResponse(
        id=str(d.id),
        client=d.client,
        marque=d.marque,
        montant=d.montant,
        statut=d.statut,
        date_devis=d.date_devis,
        date_conversion=d.date_conversion,
        created_by=d.created_by,
        created_at=d.created_at,
    )


def _current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


class DevisService:
    @staticmethod
    async def create(data: DevisCreate, current_user: User) -> DevisResponse:
        devis = Devis(**data.model_dump(), created_by=str(current_user.id))
        await devis.insert()

        await AuditLogService.log(
            action="devis_created",
            entity_type="Devis",
            entity_id=str(devis.id),
            performed_by=current_user,
            details={"client": devis.client, "montant": devis.montant},
        )
        return _to_response(devis)

    @staticmethod
    async def list_devis(current_user: User) -> list[DevisResponse]:
        if current_user.role == UserRole.COMMERCIAL:
            query = Devis.find(Devis.created_by == str(current_user.id))
        else:
            query = Devis.find_all()

        devis_list = await query.sort(-Devis.created_at).to_list()
        return [_to_response(d) for d in devis_list]

    @staticmethod
    async def update_statut(devis_id: str, data: DevisStatutUpdate, current_user: User) -> DevisResponse:
        devis = await Devis.get(devis_id)
        if not devis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Devis introuvable")

        if current_user.role == UserRole.COMMERCIAL and devis.created_by != str(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ce devis ne vous appartient pas")

        devis.statut = data.statut
        if data.statut == DevisStatut.CONVERTI:
            devis.date_conversion = datetime.now(timezone.utc)

        await devis.save()

        await AuditLogService.log(
            action="devis_statut_updated",
            entity_type="Devis",
            entity_id=str(devis.id),
            performed_by=current_user,
            details={"nouveau_statut": data.statut.value},
        )
        return _to_response(devis)

    @staticmethod
    async def get_ranking(period: str | None, current_user: User) -> list[RankingEntry]:
        target_period = period or _current_month()
        converted = await Devis.find(Devis.statut == DevisStatut.CONVERTI).to_list()
        converted = [
            d for d in converted
            if d.date_conversion and d.date_conversion.strftime("%Y-%m") == target_period
        ]

        totals: dict[str, dict] = {}
        for d in converted:
            entry = totals.setdefault(d.created_by, {"total_montant": 0.0, "nb_ventes": 0})
            entry["total_montant"] += d.montant
            entry["nb_ventes"] += 1

        users = {str(u.id): u for u in await User.find(User.role == UserRole.COMMERCIAL).to_list()}

        ranking = [
            RankingEntry(
                user_id=user_id,
                full_name=users[user_id].full_name if user_id in users else "Utilisateur inconnu",
                total_montant=data["total_montant"],
                nb_ventes=data["nb_ventes"],
                is_current_user=(user_id == str(current_user.id)),
            )
            for user_id, data in totals.items()
        ]

        ranking.sort(key=lambda r: r.total_montant, reverse=True)
        return ranking