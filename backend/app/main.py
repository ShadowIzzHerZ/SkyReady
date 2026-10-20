import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.routes import router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkyReady - AI/ML Predictive Maintenance & Google OR-Tools CP-SAT Fleet Availability Optimizer for Ministry of Defence / DSSC."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(router, prefix="/api")

# Serve Frontend static assets if built
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # If path starts with api or docs, let FastAPI handle it
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}
else:
    @app.get("/")
    def root():
        return {
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "problem_statement_id": settings.PROBLEM_STATEMENT_ID,
            "team": settings.TEAM_NAME,
            "status": "OPERATIONAL",
            "endpoints": {
                "fleet": "/api/fleet",
                "schedule": "/api/optimizer/schedule",
                "simulator": "/api/simulator/what-if",
                "spares": "/api/spares",
                "audit": "/api/audit/logs",
                "docs": "/docs"
            }
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
