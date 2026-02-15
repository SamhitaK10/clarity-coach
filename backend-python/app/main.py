"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from .config import settings
from .routes import analyze, analyze_complete

# Create FastAPI app
app = FastAPI(
    title="Clarity Coach API",
    description="AI-powered workplace communication assistant for analyzing presentation videos",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router)
app.include_router(analyze_complete.router)

# Mount static files for frontend
frontend_dir = Path(__file__).parent.parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

    @app.get("/")
    async def root():
        """Serve the frontend."""
        index_path = frontend_dir / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "Clarity Coach API is running. Visit /docs for API documentation."}
else:
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Clarity Coach API is running",
            "docs": "/docs",
            "analyze_endpoint": "/analyze"
        }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "llm_provider": settings.llm_provider,
        "llm_model": settings.llm_model
    }
