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
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    # Mount the assets directory for CSS/JS files
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Serve index.html for all frontend routes
    @app.get("/")
    async def root():
        """Serve the frontend."""
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "Clarity Coach API is running. Visit /docs for API documentation."}

    # Catch-all route for React Router (must be last)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        # If requesting a file with extension, try to serve it
        if "." in full_path:
            file_path = frontend_dist / full_path
            if file_path.exists():
                return FileResponse(str(file_path))
        # Otherwise, serve index.html (for React Router)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "File not found"}
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
