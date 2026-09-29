from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Coder(Base):
    __tablename__ = "coders"

    id = Column(String, primary_key=True, index=True)  # ej. 'c1', 'c2' o UUID
    external_id = Column(String, unique=True, nullable=True, index=True)  # ID de la API externa
    nombre = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)
    ruta = Column(String, nullable=False)  # ej. 'Avanzada · JS', 'Básica · Python'
    clan = Column(String, nullable=True)   # ej. 'Clan Gosling'
    jornada = Column(String, default="Mañana")  # 'Mañana' o 'Tarde'
    acuerdo = Column(String, default="—")  # Fecha o detalle del último acuerdo
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación con solicitudes
    solicitudes = relationship("Solicitud", back_populates="coder", cascade="all, delete-orphan")
