from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.reporte import ReporteDashboard
from app.services.report_service import ReportService

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.get("/dashboard", response_model=ReporteDashboard)
def get_reportes_dashboard(db: Session = Depends(get_db)):
    """
    Retorna métricas consolidadas (KPIs, distribución por tipo, por ruta y últimos 7 días).
    """
    service = ReportService(db)
    return service.get_dashboard_metrics()
