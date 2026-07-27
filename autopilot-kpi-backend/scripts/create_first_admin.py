"""
Script à exécuter UNE SEULE FOIS pour créer le tout premier compte
Administrateur. Nécessaire car il n'existe aucune inscription publique
(règle métier : seul un Admin peut créer des comptes).

Usage :
    python scripts/create_first_admin.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import init_db
from app.models.enums import UserRole
from app.models.user import User
from app.core.security import hash_password


async def main():
    await init_db()

    email = input("Email de l'admin : ").strip()
    full_name = input("Nom complet : ").strip()
    password = input("Mot de passe : ").strip()

    existing = await User.find_one(User.email == email)
    if existing:
        print(f"Un compte existe déjà avec l'email {email}.")
        return

    admin = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole.ADMINISTRATEUR,
    )
    await admin.insert()
    print(f"Compte Admin créé avec succès : {email}")


if __name__ == "__main__":
    asyncio.run(main())
