from sqlalchemy import Column, String, Integer
from app.core.database import Base

class ConfigUmbral(Base):
    __tablename__ = "config_umbrales"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, unique=True, nullable=False)
    cantidad = Column(Integer, nullable=False)
    ventana_dias = Column(Integer, nullable=False)
    accion_sugerida = Column(String, nullable=False)
