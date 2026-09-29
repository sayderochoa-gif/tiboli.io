from sqlalchemy import Column, String, Date, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base

class Solicitud(Base):
    __tablename__ = "solicitudes"

    id = Column(String, primary_key=True, index=True)  # ej. 'C-1042'
    coder_id = Column(String, ForeignKey("coders.id"), nullable=False, index=True)
    tipo = Column(String, nullable=False)  # 'Tardanza', 'Permiso', 'Ausencia'
    fecha = Column(Date, default=date.today, nullable=False)
    
    motivo_categoria = Column(String, default="Otro")  # Del catálogo de 10 motivos
    motivo = Column(Text, nullable=False)               # Explicación del coder
    
    evidencia = Column(Boolean, default=False)          # Si adjuntó soporte
    evidencia_url = Column(String, nullable=True)       # Ruta/nombre de archivo si lo subió
    
    estado = Column(String, default="Pendiente")        # 'Pendiente', 'Aprobado', 'Rechazado'
    clasif = Column(String, default="Requiere evidencia") # 'Justificada', 'Injustificada', 'Requiere evidencia'
    prioridad = Column(String, default="Media")         # 'Baja', 'Media', 'Alta'
    
    politica = Column(Text, nullable=True)              # Artículos citados de Reglas.txt o PDF
    borrador = Column(Text, nullable=True)              # Borrador de respuesta sugerido
    
    canal_reporte = Column(String, default="Web")       # 'Web', 'Discord', 'Correo'
    created_at = Column(DateTime, default=datetime.utcnow)

    coder = relationship("Coder", back_populates="solicitudes")
