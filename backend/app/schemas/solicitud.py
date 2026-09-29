from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class SolicitudBase(BaseModel):
    tipo: str  # 'Tardanza', 'Permiso', 'Ausencia'
    fecha: date
    motivo_categoria: Optional[str] = "Otro"
    motivo: str
    evidencia: Optional[bool] = False
    canal_reporte: Optional[str] = "Web"

class SolicitudCreate(SolicitudBase):
    coder_id: str

class SolicitudResolve(BaseModel):
    estado: str  # 'Aprobado', 'Rechazado', 'Pendiente'
    clasif: Optional[str] = None  # 'Justificada', 'Injustificada', 'Requiere evidencia'
    borrador: Optional[str] = None  # Respuesta editada enviada al coder

class SolicitudResponse(SolicitudBase):
    id: str
    coder_id: str
    evidencia_url: Optional[str] = None
    estado: str
    clasif: str
    prioridad: str
    politica: Optional[str] = None
    borrador: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
