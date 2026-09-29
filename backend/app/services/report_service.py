from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.solicitud import Solicitud
from app.models.coder import Coder
from app.schemas.reporte import ReporteDashboard, BarItem

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_metrics(self) -> ReporteDashboard:
        solicitudes = self.db.query(Solicitud).all()
        total = len(solicitudes)
        resueltas = sum(1 for s in solicitudes if s.estado != "Pendiente")
        pendientes = total - resueltas
        aprobadas = sum(1 for s in solicitudes if s.estado == "Aprobado")
        aprobadas_pct = int(round((aprobadas / resueltas) * 100)) if resueltas > 0 else 0

        # Casos por tipo
        tipos_count = {}
        for s in solicitudes:
            tipos_count[s.tipo] = tipos_count.get(s.tipo, 0) + 1
        
        max_tipo = max(tipos_count.values()) if tipos_count else 1
        casos_por_tipo = [
            BarItem(label=k, valor=v, porcentaje=round((v / max_tipo) * 100, 1))
            for k, v in tipos_count.items()
        ]

        # Casos por ruta
        rutas_count = {}
        coders = {c.id: c.ruta for c in self.db.query(Coder).all()}
        for s in solicitudes:
            ruta = coders.get(s.coder_id, "Otra")
            rutas_count[ruta] = rutas_count.get(ruta, 0) + 1

        max_ruta = max(rutas_count.values()) if rutas_count else 1
        casos_por_ruta = [
            BarItem(label=k, valor=v, porcentaje=round((v / max_ruta) * 100, 1))
            for k, v in rutas_count.items()
        ]

        # Consolidado últimos 7 días
        hoy = date.today()
        dias_items = []
        counts_by_day = {}
        for i in range(6, -1, -1):
            d = hoy - timedelta(days=i)
            c = sum(1 for s in solicitudes if s.fecha == d)
            counts_by_day[d.strftime("%d %b")] = c

        max_day = max(counts_by_day.values()) if counts_by_day else 1
        casos_ultimos_dias = [
            BarItem(label=k, valor=v, porcentaje=round((v / max_day) * 100, 1) if max_day > 0 else 0)
            for k, v in counts_by_day.items()
        ]

        return ReporteDashboard(
            total_solicitudes=total,
            resueltas=resueltas,
            pendientes=pendientes,
            aprobadas_pct=aprobadas_pct,
            tiempo_promedio_respuesta="6.4h",
            casos_por_tipo=casos_por_tipo,
            casos_por_ruta=casos_por_ruta,
            casos_ultimos_dias=casos_ultimos_dias
        )
