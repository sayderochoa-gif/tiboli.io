from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class CoderBase(BaseModel):
    nombre: str
    ruta: str
    clan: Optional[str] = None
    jornada: Optional[str] = "Mañana"
    email: Optional[str] = None
    acuerdo: Optional[str] = "—"

class CoderCreate(CoderBase):
    id: str
    external_id: Optional[str] = None

class CoderResponse(CoderBase):
    id: str
    external_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CoderWithMetrics(CoderResponse):
    tardanza: int = 0
    permiso: int = 0
    ausencia: int = 0
    injustificados: int = 0
    nivel: str = "normal"  # 'normal' | 'alerta' | 'riesgo'
    total_casos: int = 0
