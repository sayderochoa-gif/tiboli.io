from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.schemas.coder import CoderResponse, CoderWithMetrics
from app.schemas.solicitud import SolicitudResponse
from app.services.attendance_service import AttendanceService
from app.adapters.coders_client import get_coders_client
from app.models.solicitud import Solicitud

router = APIRouter(prefix="/coders", tags=["Coders"])

@router.get("", response_model=List[CoderResponse])
def get_all_coders(db: Session = Depends(get_db)):
    service = AttendanceService(db, get_coders_client())
    return service.get_coders_with_metrics()

@router.get("/riesgo", response_model=List[CoderWithMetrics])
def get_coders_en_riesgo(db: Session = Depends(get_db)):
    """
    Retorna la lista de coders con conteo de tardanzas, permisos, ausencias
    y el nivel de riesgo clasificado ('riesgo', 'alerta', 'normal').
    """
    service = AttendanceService(db, get_coders_client())
    return service.get_coders_with_metrics()

@router.get("/{coder_id}/historial")
def get_coder_historial(coder_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retorna el historial completo de solicitudes y KPIs del coder
    para alimentar la vista 'Mi historial' en el portal coder.
    """
    solicitudes = db.query(Solicitud).filter(Solicitud.coder_id == coder_id).order_by(Solicitud.fecha.desc()).all()
    
    tardanzas = sum(1 for s in solicitudes if s.tipo == "Tardanza")
    permisos = sum(1 for s in solicitudes if s.tipo == "Permiso")
    ausencias = sum(1 for s in solicitudes if s.tipo == "Ausencia")
    injustificados = sum(1 for s in solicitudes if s.clasif == "Injustificada")

    return {
        "coder_id": coder_id,
        "kpis": {
            "total_casos": len(solicitudes),
            "tardanzas": tardanzas,
            "permisos": permisos,
            "ausencias": ausencias,
            "injustificados": injustificados
        },
        "historial": [SolicitudResponse.model_validate(s) for s in solicitudes]
    }

@router.post("/sync")
async def sync_coders_from_external(db: Session = Depends(get_db)):
    """
    Fuerza la sincronización de la lista de coders desde el cliente externo (o Mock).
    """
    service = AttendanceService(db, get_coders_client())
    await service.sync_coders_if_empty()
    return {"message": "Sincronización completada exitosamente"}
