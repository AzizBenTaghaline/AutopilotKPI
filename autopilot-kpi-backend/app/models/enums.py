from enum import Enum


class UserRole(str, Enum):

    ADMINISTRATEUR = "administrateur"
    MANAGER = "manager"
    COMMERCIAL = "commercial"
    CHEF_ATELIER = "chef_atelier"

class KpiModule(str, Enum):
    COMMERCIAL = "commercial"
    SAV = "sav"

class Periodicity(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    FREE = "free" 

class KpiDirection(str, Enum):
    HIGHER_IS_BETTER = "higher_is_better"
    LOWER_IS_BETTER = "lower_is_better"