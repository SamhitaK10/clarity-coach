"""
Video analysis endpoint.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
import cv2
import io
import numpy as np

from ..models.schemas import AnalysisResponse, ErrorResponse, VideoMetrics, RawFeatures
# Use local processing (no Modal required)
from ..services.modal_client_local import modal_client
from ..services.llm_client import llm_client
from ..config import settings

router = APIRouter(tags=["analysis"])


def validate_video(file: UploadFile, video_bytes: bytes) -> tuple[bool, str]:
    """
    Validate video file format and size.

    Args:
        file: Uploaded file object
        video_bytes: Video file bytes

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check file size
    if len(video_bytes) > settings.max_video_size_bytes:
        return False, f"Video file too large. Maximum size is {settings.max_video_size_mb}MB"

    # Check content type
    valid_content_types = ["video/mp4", "video/avi", "video/mov", "video/webm", "video/quicktime"]
    if file.content_type not in valid_content_types:
        return False, f"Invalid video format. Supported formats: MP4, AVI, MOV, WEBM"

    # Try to open with OpenCV to validate it's a real video
    try:
        # Write to temp file for OpenCV validation
        temp_path = "/tmp/validate_video.mp4"
        with open(temp_path, "wb") as f:
            f.write(video_bytes)

        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            return False, "Failed to read video file. File may be corrupted."

        # Check duration
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0

        cap.release()

        if duration > settings.max_video_duration_seconds:
            return False, f"Video too long. Maximum duration is {settings.max_video_duration_seconds} seconds"

        if duration < 1:
            return False, "Video too short. Minimum duration is 1 second"

        return True, ""

    except Exception as e:
        return False, f"Video validation failed: {str(e)}"


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request - Invalid video file"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    }
)
async def analyze_video(file: UploadFile = File(..., description="Video file to analyze (MP4, AVI, MOV, WEBM)")):
    """
    Analyze a video for nonverbal communication metrics.

    This endpoint:
    1. Validates the uploaded video
    2. Processes it with MediaPipe to extract nonverbal metrics
    3. Generates AI coaching feedback based on the metrics

    **Expected processing time**: 15-40 seconds for typical 30-60s videos.

    **Returns**:
    - `metrics`: Eye contact, posture, and gesture scores (0-100)
    - `feedback`: AI-generated coaching suggestions
    - `raw_features`: Raw extracted features (optional)
    - `frame_count`: Number of video frames processed
    """
    try:
        # Read video bytes
        video_bytes = await file.read()

        print(f"Received video: {file.filename}, size: {len(video_bytes) / (1024*1024):.2f}MB")

        # Validate video
        is_valid, error_msg = validate_video(file, video_bytes)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        print("Video validation passed, sending to Modal for processing...")

        # Process video with Modal
        modal_result = await modal_client.process_video(video_bytes)

        # Check for processing errors
        if modal_result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Video processing failed: {modal_result['error']}"
            )

        metrics = modal_result['metrics']
        raw_features = modal_result.get('raw_features')
        frame_count = modal_result.get('frame_count', 0)

        print(f"Processed {frame_count} frames. Metrics: {metrics}")

        # Generate coaching feedback with LLM
        print("Generating coaching feedback with LLM...")
        feedback = await llm_client.generate_feedback(metrics)

        print("Analysis complete!")

        # Build response
        response = AnalysisResponse(
            metrics=VideoMetrics(**metrics),
            feedback=feedback,
            raw_features=RawFeatures(**raw_features) if raw_features else None,
            frame_count=frame_count
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        print(f"Unexpected error in analyze endpoint: {str(e)}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
