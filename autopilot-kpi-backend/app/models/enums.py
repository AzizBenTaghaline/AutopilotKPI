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

class ReclamationStatut(str, Enum):
    OUVERTE = "ouverte"
    EN_COURS = "en_cours"
    RESOLUE = "resolue"      

class ImportEntityType(str, Enum):
    KPI_ENTRY = "kpi_entry"
    SAV_RETOUR = "sav_retour"
    SAV_RECLAMATION = "sav_reclamation"

class ImportStatus(str, Enum):
    PROCESSING = "processing"
    SUCCESS = "success"       
    PARTIAL = "partial"    
    FAILED = "failed"         

class DevisStatut(str, Enum):
    EN_COURS = "en_cours"
    CONVERTI = "converti"
    PERDU = "perdu"

class OrdreReparationStatut(str, Enum):
    NON_FACTURE = "non_facture"
    FACTURE = "facture"