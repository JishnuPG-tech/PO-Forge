from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from backend.app.core.config import settings
from backend.app.api.routers.auth import router as auth_router
from backend.app.api.routers.questions import router as questions_router
from backend.app.api.routers.missions import router as missions_router
from backend.app.api.routers.analytics import router as analytics_router
from backend.app.api.routers.documents import router as documents_router
from backend.app.api.routers.hermes_ai import router as hermes_ai_router
from backend.app.routers.hermes import router as hermes_device_router

app = FastAPI(
    title="POForge & Hermes: Banking Mastery & Agentic AI API",
    description="Backend reasoning, exhaustive questions repository, and practice engine orchestration.",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Scoped CORS Allowlist for Production & Local Development
allowed_origins = [
    "https://po-forge.vercel.app",
    "https://po-forge-jishnu-pgs-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]

custom_origin = os.environ.get("ALLOWED_ORIGIN")
if custom_origin and custom_origin not in allowed_origins:
    allowed_origins.append(custom_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(questions_router, prefix="/api/v1")
app.include_router(missions_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(hermes_ai_router, prefix="/api/v1")
app.include_router(hermes_device_router)

@app.get("/")
@app.get("/health")
def root_health_check():
    return {
        "status": "HEALTHY",
        "app_name": "POForge & Hermes Practice API",
        "version": "2.1.0",
        "environment": os.environ.get("ENVIRONMENT", "production")
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "message": "Internal Server Error",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
