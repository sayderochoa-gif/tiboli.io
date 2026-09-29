from pydantic import BaseModel
from typing import Dict, List

class BarItem(BaseModel):
    label: str
    valor: int
    porcentaje: float = 0.0

class ReporteDashboard(BaseModel):
    total_solicitudes: int
    resueltas: int
    pendientes: int
    aprobadas_pct: int
    tiempo_promedio_respuesta: str = "6.4h"
    casos_por_tipo: List[BarItem]
    casos_por_ruta: List[BarItem]
    casos_ultimos_dias: List[BarItem]
