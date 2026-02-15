"""
Configuration management using Pydantic Settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Note: Modal authentication is handled via CLI (modal token new)
    # No Modal credentials needed in environment variables

    # LLM Configuration
    llm_provider: Literal["openai", "anthropic"] = "openai"
    llm_model: str = "gpt-4o-mini"
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Backend Configuration
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    max_video_size_mb: int = 50
    max_video_duration_seconds: int = 90

    # Video Processing Configuration
    frame_skip_interval: int = 3  # Process every Nth frame (1=all frames, 2=every other, 3=every third)

    # CORS Configuration
    cors_origins: list[str] = ["http://localhost:8000", "http://127.0.0.1:8000"]

    model_config = SettingsConfigDict(
        env_file="../.env",  # Look in parent directory (project root)
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def max_video_size_bytes(self) -> int:
        """Convert MB to bytes for file size validation."""
        return self.max_video_size_mb * 1024 * 1024

    def get_llm_api_key(self) -> str:
        """Get the appropriate API key based on provider."""
        if self.llm_provider == "openai":
            return self.openai_api_key
        elif self.llm_provider == "anthropic":
            return self.anthropic_api_key
        else:
            raise ValueError(f"Unknown LLM provider: {self.llm_provider}")


# Global settings instance
settings = Settings()
