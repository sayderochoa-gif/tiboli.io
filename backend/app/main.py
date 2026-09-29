from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import Base, engine
from app.seed import seed_database
from app.routers import solicitudes, coders, reportes, config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas y sembrar datos de prueba si la base de datos está vacía
    Base.metadata.create_all(bind=engine)
    seed_database()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend para el Sistema de Solicitudes HSE y Asistencia Riwi",
    lifespan=lifespan
)

# Configuración de CORS para permitir peticiones desde riwi_hse_app.html
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(solicitudes.router, prefix=settings.API_PREFIX)
app.include_router(coders.router, prefix=settings.API_PREFIX)
app.include_router(reportes.router, prefix=settings.API_PREFIX)
app.include_router(config.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "mock_coders_active": settings.USE_MOCK_CODERS_API
    }
