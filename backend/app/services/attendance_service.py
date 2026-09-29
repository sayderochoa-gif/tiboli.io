from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import date
from app.models.coder import Coder
from app.models.solicitud import Solicitud
from app.schemas.solicitud import SolicitudCreate, SolicitudResolve
from app.schemas.coder import CoderWithMetrics
from app.services.rules_engine import RulesEngine
from app.adapters.coders_client import BaseCodersClient

class AttendanceService:
    def __init__(self, db: Session, coders_client: BaseCodersClient):
        self.db = db
        self.coders_client = coders_client

    async def sync_coders_if_empty(self):
        """Sincroniza coders desde el cliente (Mock o API del TL) si la BD local está vacía."""
        count = self.db.query(Coder).count()
        if count == 0:
            external_coders = await self.coders_client.get_all_coders()
            for c_data in external_coders:
                coder = Coder(
                    id=c_data["id"],
                    external_id=c_data.get("external_id"),
                    nombre=c_data["nombre"],
                    email=c_data.get("email"),
                    ruta=c_data["ruta"],
                    clan=c_data.get("clan"),
                    jornada=c_data.get("jornada", "Mañana"),
                    acuerdo=c_data.get("acuerdo", "—")
                )
                self.db.add(coder)
            self.db.commit()

    def get_coders_with_metrics(self) -> List[CoderWithMetrics]:
        coders = self.db.query(Coder).all()
        result = []

        for c in coders:
            solicitudes = self.db.query(Solicitud).filter(Solicitud.coder_id == c.id).all()
            
            tardanzas = sum(1 for s in solicitudes if s.tipo == "Tardanza")
            permisos = sum(1 for s in solicitudes if s.tipo == "Permiso")
            ausencias = sum(1 for s in solicitudes if s.tipo == "Ausencia")
            injustificados = sum(1 for s in solicitudes if s.clasif == "Injustificada")
            
            nivel = RulesEngine.calculate_coder_level(injustificados, ausencias, tardanzas)

            result.append(CoderWithMetrics(
                id=c.id,
                external_id=c.external_id,
                nombre=c.nombre,
                email=c.email,
                ruta=c.ruta,
                clan=c.clan,
                jornada=c.jornada,
                acuerdo=c.acuerdo,
                created_at=c.created_at,
                tardanza=tardanzas,
                permiso=permisos,
                ausencia=ausencias,
                injustificados=injustificados,
                nivel=nivel,
                total_casos=len(solicitudes)
            ))
        return result

    def get_solicitudes(self, estado: Optional[str] = None, tipo: Optional[str] = None, search: Optional[str] = None) -> List[Solicitud]:
        query = self.db.query(Solicitud).join(Coder)

        if estado and estado != "todos":
            query = query.filter(Solicitud.estado == estado)
        if tipo and tipo != "todos":
            query = query.filter(Solicitud.tipo == tipo)
        if search:
            search_fmt = f"%{search.lower()}%"
            query = query.filter(
                (func.lower(Coder.nombre).like(search_fmt)) |
                (func.lower(Solicitud.motivo).like(search_fmt)) |
                (func.lower(Solicitud.tipo).like(search_fmt)) |
                (func.lower(Solicitud.id).like(search_fmt))
            )

        return query.order_by(Solicitud.fecha.desc()).all()

    def get_solicitud_by_id(self, solicitud_id: str) -> Optional[Solicitud]:
        return self.db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()

    def create_solicitud(self, data: SolicitudCreate, evidencia_url: Optional[str] = None) -> Solicitud:
        coder = self.db.query(Coder).filter(Coder.id == data.coder_id).first()
        if not coder:
            raise ValueError(f"Coder con id {data.coder_id} no encontrado")

        # Generar ID correlativo ej. C-1043
        total_solicitudes = self.db.query(Solicitud).count()
        nuevo_id = f"C-{1043 + total_solicitudes}"

        # Contar injustificados previos para contexto
        injustificados_previos = self.db.query(Solicitud).filter(
            Solicitud.coder_id == data.coder_id,
            Solicitud.clasif == "Injustificada"
        ).count()

        # Evaluación por el motor de reglas
        tiene_evidencia = bool(data.evidencia or evidencia_url)
        clasif, prioridad, politica, borrador = RulesEngine.evaluate_solicitud(
            tipo=data.tipo,
            motivo=data.motivo,
            motivo_cat=data.motivo_categoria or "Otro",
            tiene_evidencia=tiene_evidencia,
            coder_nombre=coder.nombre,
            injustificados_previos=injustificados_previos
        )

        nueva = Solicitud(
            id=nuevo_id,
            coder_id=data.coder_id,
            tipo=data.tipo,
            fecha=data.fecha,
            motivo_categoria=data.motivo_categoria or "Otro",
            motivo=data.motivo,
            evidencia=tiene_evidencia,
            evidencia_url=evidencia_url,
            estado="Pendiente",
            clasif=clasif,
            prioridad=prioridad,
            politica=politica,
            borrador=borrador,
            canal_reporte=data.canal_reporte or "Web"
        )

        self.db.add(nueva)
        self.db.commit()
        self.db.refresh(nueva)
        return nueva

    def resolve_solicitud(self, solicitud_id: str, data: SolicitudResolve) -> Optional[Solicitud]:
        solicitud = self.db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
        if not solicitud:
            return None

        solicitud.estado = data.estado
        if data.clasif:
            solicitud.clasif = data.clasif
        if data.borrador:
            solicitud.borrador = data.borrador

        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud
