"""
Pydantic models for API request/response schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional


class VideoMetrics(BaseModel):
    """Nonverbal communication metrics (0-100 scores)."""

    eye_contact_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Eye contact score (0-100). Higher is better."
    )
    posture_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Posture score (0-100). Higher indicates more upright posture."
    )
    gesture_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Gesture activity score (0-100). Moderate gesturing scores highest."
    )


class RawFeatures(BaseModel):
    """Raw features extracted from video analysis."""

    eye_contact_ratio: float = Field(
        ...,
        description="Fraction of frames with eye contact (0-1)"
    )
    avg_torso_length: float = Field(
        ...,
        description="Average torso length (shoulder to hip distance)"
    )
    avg_hand_motion: float = Field(
        ...,
        description="Average hand motion (wrist displacement per frame)"
    )


class AnalysisResponse(BaseModel):
    """Response from the /analyze endpoint."""

    metrics: VideoMetrics = Field(
        ...,
        description="Computed nonverbal metrics"
    )
    feedback: str = Field(
        ...,
        description="AI-generated coaching feedback based on metrics"
    )
    raw_features: Optional[RawFeatures] = Field(
        None,
        description="Raw features used to compute metrics (optional debug info)"
    )
    frame_count: Optional[int] = Field(
        None,
        description="Number of frames processed"
    )


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str = Field(
        ...,
        description="Error message"
    )
    detail: Optional[str] = Field(
        None,
        description="Additional error details"
    )
