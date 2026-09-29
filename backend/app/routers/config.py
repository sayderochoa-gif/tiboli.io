from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.config_umbral import ConfigUmbral
from app.schemas.config import UmbralResponse, UmbralUpdate

router = APIRouter(prefix="/config", tags=["Configuración"])

@router.get("/umbrales", response_model=List[UmbralResponse])
def get_umbrales(db: Session = Depends(get_db)):
    return db.query(ConfigUmbral).all()

@router.put("/umbrales/{umbral_id}", response_model=UmbralResponse)
def update_umbral(umbral_id: int, data: UmbralUpdate, db: Session = Depends(get_db)):
    umbral = db.query(ConfigUmbral).filter(ConfigUmbral.id == umbral_id).first()
    if not umbral:
        raise HTTPException(status_code=404, detail="Umbral no encontrado")
    
    umbral.cantidad = data.cantidad
    umbral.ventana_dias = data.ventana_dias
    umbral.accion_sugerida = data.accion_sugerida

    db.commit()
    db.refresh(umbral)
    return umbral
