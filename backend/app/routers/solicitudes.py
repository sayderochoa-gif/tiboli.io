from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os
import shutil

from app.core.database import get_db
from app.core.config import settings
from app.schemas.solicitud import SolicitudResponse, SolicitudCreate, SolicitudResolve
from app.services.attendance_service import AttendanceService
from app.adapters.coders_client import get_coders_client

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])

@router.get("", response_model=List[SolicitudResponse])
def get_solicitudes(
    estado: Optional[str] = Query(None, description="Filtrar por estado: Pendiente, Aprobado, Rechazado"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: Tardanza, Permiso, Ausencia"),
    search: Optional[str] = Query(None, description="Buscar por nombre de coder o motivo"),
    db: Session = Depends(get_db)
):
    service = AttendanceService(db, get_coders_client())
    return service.get_solicitudes(estado=estado, tipo=tipo, search=search)

@router.get("/{solicitud_id}", response_model=SolicitudResponse)
def get_solicitud(solicitud_id: str, db: Session = Depends(get_db)):
    service = AttendanceService(db, get_coders_client())
    solicitud = service.get_solicitud_by_id(solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud

@router.post("", response_model=SolicitudResponse, status_code=201)
def create_solicitud(
    solicitud_in: SolicitudCreate,
    db: Session = Depends(get_db)
):
    service = AttendanceService(db, get_coders_client())
    try:
        return service.create_solicitud(solicitud_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/con-evidencia", response_model=SolicitudResponse, status_code=201)
async def create_solicitud_con_evidencia(
    coder_id: str = Form(...),
    tipo: str = Form(...),
    fecha: date = Form(...),
    motivo: str = Form(...),
    motivo_categoria: Optional[str] = Form("Otro"),
    archivo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    evidencia_url = None
    if archivo:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, f"{coder_id}_{archivo.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)
        evidencia_url = file_path

    data = SolicitudCreate(
        coder_id=coder_id,
        tipo=tipo,
        fecha=fecha,
        motivo=motivo,
        motivo_categoria=motivo_categoria,
        evidencia=bool(archivo)
    )
    service = AttendanceService(db, get_coders_client())
    return service.create_solicitud(data, evidencia_url=evidencia_url)

@router.patch("/{solicitud_id}/resolver", response_model=SolicitudResponse)
def resolve_solicitud(
    solicitud_id: str,
    data: SolicitudResolve,
    db: Session = Depends(get_db)
):
    service = AttendanceService(db, get_coders_client())
    solicitud = service.resolve_solicitud(solicitud_id, data)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud
