# Riwi HSE Attendance — Backend API

Backend en **Python (FastAPI + SQLAlchemy + Pydantic)** para la gestión de solicitudes de asistencia, inasistencias y seguimiento de permanencia HSE en Riwi, estructurado según las reglas de los 3 documentos base:
- `riwi_hse_app.html` (Vistas, estados, flujos y dashboard)
- `Seguimiento a asistencias- Tl Riwi Baq (2).pdf` (Matriz de escalamiento TL -> HSE y catálogo oficial de 10 motivos)
- `Reglas.txt` (Capítulo II: tiempos de soporte máx 3 días, límite de 2 excusas no médicas, umbrales U1 a U4 y protocolo de abandono)

---

## 🚀 Cómo Ejecutar el Backend

### 1. Activar el entorno virtual (ya configurado)
En Windows PowerShell:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
```

### 2. Iniciar el servidor de desarrollo
```powershell
uvicorn app.main:app --reload --port 8000
```

### 3. Documentación Interactiva (Swagger)
Abre en tu navegador:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔌 Conexión con la API de Coders (Patrón Adaptador)

Dado que la API oficial de coders será provista más adelante por el **Team Leader**, el backend implementa el **Patrón Adaptador** en `app/adapters/coders_client.py`:

* **Modo Mock (Activo por defecto)**: Usa `MockCodersClient`, que provee los 7 coders iniciales de la demo (Valentina, Andrés, Camila, etc.) para que el equipo trabaje de inmediato.
* **Modo Real (Listo para conectar)**: Cuando el Team Leader entregue la URL y credenciales, solo debes cambiar en el archivo `.env` o en `app/core/config.py`:
  ```ini
  USE_MOCK_CODERS_API=False
  EXTERNAL_CODERS_API_URL=https://api.tu-servidor-riwi.com/v1
  EXTERNAL_CODERS_API_TOKEN=tu_token_aqui
  ```
  El resto de la aplicación (solicitudes, umbrales, reportes) seguirá funcionando exactamente igual sin modificar una sola línea de lógica de negocio.

---

## 🏛️ Estructura del Proyecto

```text
backend/
├── app/
│   ├── core/
│   │   ├── config.py           # Configuración con Pydantic Settings
│   │   └── database.py         # Conexión SQLAlchemy (SQLite local / PostgreSQL prod)
│   ├── models/                 # Modelos de Base de Datos
│   │   ├── coder.py            # Entidad Coder y réplica de API externa
│   │   ├── solicitud.py        # Solicitudes (Tardanza, Permiso, Ausencia)
│   │   └── config_umbral.py    # Umbrales configurables
│   ├── schemas/                # Validación de datos con Pydantic
│   ├── services/
│   │   ├── rules_engine.py     # MOTOR DE REGLAS (Reglas.txt y PDF TL)
│   │   ├── attendance_service.py # Lógica de solicitudes y coders en riesgo
│   │   └── report_service.py   # Métricas y agregaciones para el dashboard
│   ├── adapters/
│   │   └── coders_client.py    # Adaptador desacoplado para la API de Coders
│   ├── routers/                # Endpoints RESTful
│   │   ├── solicitudes.py      # /api/solicitudes
│   │   ├── coders.py           # /api/coders (con cálculo de nivel normal/alerta/riesgo)
│   │   ├── reportes.py         # /api/reportes/dashboard
│   │   └── config.py           # /api/config/umbrales
│   ├── seed.py                 # Datos semilla iniciales
│   └── main.py                 # Punto de entrada de FastAPI + CORS
├── requirements.txt
└── README.md
```

---

## 🧪 Endpoints Principales

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/solicitudes` | Lista solicitudes con filtros (`estado`, `tipo`, `search`) |
| `POST` | `/api/solicitudes` | Radica una nueva solicitud (evalúa reglas automáticamente) |
| `POST` | `/api/solicitudes/con-evidencia` | Radica solicitud adjuntando archivo de soporte (PDF/JPG) |
| `GET` | `/api/solicitudes/{id}` | Expediente con evaluación de política y borrador de respuesta |
| `PATCH`| `/api/solicitudes/{id}/resolver`| Resuelve caso (`Aprobado`, `Rechazado`, `Pendiente`) |
| `GET` | `/api/coders/riesgo` | Lista de coders con conteo y clasificación (`normal`, `alerta`, `riesgo`) |
| `GET` | `/api/coders/{id}/historial` | Historial individual y KPIs del coder |
| `GET` | `/api/reportes/dashboard` | KPIs generales y datos para gráficos de barras |
