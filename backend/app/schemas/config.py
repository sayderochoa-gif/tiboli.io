from pydantic import BaseModel, ConfigDict

class UmbralResponse(BaseModel):
    id: int
    nombre: str
    cantidad: int
    ventana_dias: int
    accion_sugerida: str

    model_config = ConfigDict(from_attributes=True)

class UmbralUpdate(BaseModel):
    cantidad: int
    ventana_dias: int
    accion_sugerida: str
