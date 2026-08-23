from fastapi import APIRouter, Depends, File, UploadFile

from fastapi.responses import StreamingResponse
from io import BytesIO
from app.core.dependencies import get_current_user, require_role
from app.core.permissions import SAV_ROLES
from app.models.user import User
from app.schemas.import_record import ImportResponse
from app.services.import_service import ImportService

router = APIRouter(prefix="/imports", tags=["Imports"])


@router.post("/kpi-entries", response_model=ImportResponse)
async def import_kpi_entries(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await ImportService.import_kpi_entries(file, current_user)


@router.post(
    "/sav-retours",
    response_model=ImportResponse,
    dependencies=[Depends(require_role(*SAV_ROLES))],
)
async def import_sav_retours(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await ImportService.import_sav_retours(file, current_user)


@router.post(
    "/sav-reclamations",
    response_model=ImportResponse,
    dependencies=[Depends(require_role(*SAV_ROLES))],
)
async def import_sav_reclamations(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await ImportService.import_sav_reclamations(file, current_user)

@router.get("/kpi-entries/format")
async def get_kpi_import_format(current_user: User = Depends(get_current_user)):
    return await ImportService.get_kpi_import_format(current_user)


@router.get("/kpi-entries/template")
async def download_kpi_import_template(current_user: User = Depends(get_current_user)):
    content = await ImportService.generate_kpi_import_template(current_user)
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=modele_import_kpi.xlsx"},
    )

@router.get("", response_model=list[ImportResponse])
async def list_imports(current_user: User = Depends(get_current_user)):
    return await ImportService.list_imports(current_user)