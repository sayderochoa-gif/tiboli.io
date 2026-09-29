from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import httpx
from app.core.config import settings

class BaseCodersClient(ABC):
    """
    Contrato estándar para obtener coders.
    Permite desacoplar el backend mientras el Team Leader define la API externa.
    """
    @abstractmethod
    async def get_all_coders(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_coder_by_id(self, coder_id: str) -> Optional[Dict[str, Any]]:
        pass

class MockCodersClient(BaseCodersClient):
    """
    Implementación simulada basada en los coders definidos en riwi_hse_app.html.
    Permite al equipo avanzar sin bloqueos.
    """
    def __init__(self):
        self._coders = [
            {"id": "c1", "external_id": "EXT-001", "nombre": "Valentina Ríos", "ruta": "Avanzada · JS", "clan": "Clan Berners-Lee", "jornada": "Mañana", "email": "valentina.rios@riwi.io", "acuerdo": "—"},
            {"id": "c2", "external_id": "EXT-002", "nombre": "Andrés Palacio", "ruta": "Básica · Python", "clan": "Clan Lovelace", "jornada": "Mañana", "email": "andres.palacio@riwi.io", "acuerdo": "—"},
            {"id": "c3", "external_id": "EXT-003", "nombre": "Camila Zapata", "ruta": "Avanzada · JS", "clan": "Clan Berners-Lee", "jornada": "Tarde", "email": "camila.zapata@riwi.io", "acuerdo": "12 sep 2026"},
            {"id": "c4", "external_id": "EXT-004", "nombre": "Juan Esteban Ortiz", "ruta": "Básica · Python", "clan": "Clan Lovelace", "jornada": "Tarde", "email": "juan.ortiz@riwi.io", "acuerdo": "—"},
            {"id": "c5", "external_id": "EXT-005", "nombre": "Laura Mosquera", "ruta": "HSE · Socioemocional", "clan": "Clan Gosling", "jornada": "Mañana", "email": "laura.mosquera@riwi.io", "acuerdo": "—"},
            {"id": "c6", "external_id": "EXT-006", "nombre": "Kevin Sánchez", "ruta": "Avanzada · JS", "clan": "Clan Berners-Lee", "jornada": "Tarde", "email": "kevin.sanchez@riwi.io", "acuerdo": "20 sep 2026"},
            {"id": "c7", "external_id": "EXT-007", "nombre": "Daniela Arboleda", "ruta": "Básica · Python", "clan": "Clan Lovelace", "jornada": "Mañana", "email": "daniela.arboleda@riwi.io", "acuerdo": "—"}
        ]

    async def get_all_coders(self) -> List[Dict[str, Any]]:
        return self._coders

    async def get_coder_by_id(self, coder_id: str) -> Optional[Dict[str, Any]]:
        for c in self._coders:
            if c["id"] == coder_id or c.get("external_id") == coder_id:
                return c
        return None

class HttpCodersClient(BaseCodersClient):
    """
    Implementación real lista para conectarse cuando el Team Leader suministre la API oficial.
    """
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self.headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    async def get_all_coders(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/coders", headers=self.headers, timeout=10.0)
            response.raise_for_status()
            return response.json()

    async def get_coder_by_id(self, coder_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/coders/{coder_id}", headers=self.headers, timeout=10.0)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()

def get_coders_client() -> BaseCodersClient:
    """
    Fábrica que entrega el cliente mock o el cliente real según configuración.
    """
    if settings.USE_MOCK_CODERS_API:
        return MockCodersClient()
    return HttpCodersClient(settings.EXTERNAL_CODERS_API_URL, settings.EXTERNAL_CODERS_API_TOKEN)
