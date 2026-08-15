from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

# Configure CORS Middleware for Next.js 15 Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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
def root_health_check():
    return {
        "status": "HEALTHY",
        "app_name": "POForge: Personal AI Banking Coach",
        "version": "2.0.0",
        "environment": "production",
        "hermes_base_url": settings.HERMES_BASE_URL,
        "omniroute_base_url": settings.OMNIROUTE_BASE_URL
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
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
