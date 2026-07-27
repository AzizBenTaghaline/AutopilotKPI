from enum import Enum


class UserRole(str, Enum):

    ADMINISTRATEUR = "administrateur"
    MANAGER = "manager"
    COMMERCIAL = "commercial"
    CHEF_ATELIER = "chef_atelier"
