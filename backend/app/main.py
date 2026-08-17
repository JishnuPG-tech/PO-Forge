from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from backend.app.core.config import settings
from backend.app.api.routers import (
    auth_router, documents_router, questions_router,
    hermes_router, missions_router, analytics_router
)

app = FastAPI(
    title="POForge: Personal AI Banking Coach API",
    description="Production-Grade API Platform for IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, RBI Assistant Examination Coaching.",
    version="2.0.0",
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

# Support additional custom origin via env var if needed
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
app.include_router(documents_router, prefix="/api/v1")
app.include_router(questions_router, prefix="/api/v1")
app.include_router(hermes_router, prefix="/api/v1")
app.include_router(missions_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")

@app.get("/")
@app.get("/health")
def root_health_check():
    return {
        "status": "HEALTHY",
        "app_name": "POForge: Personal AI Banking Coach",
        "version": "2.0.0",
        "environment": os.environ.get("ENVIRONMENT", "production"),
        "database_type": "postgresql" if "postgresql" in str(settings.DATABASE_URL) else "sqlite"
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
