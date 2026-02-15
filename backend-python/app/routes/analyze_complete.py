"""
Complete video analysis route - analyzes both nonverbal and verbal communication.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import httpx
import io

from ..services.modal_client_local import ModalClient
from ..services.audio_extractor import AudioExtractor
from ..services.llm_client import LLMClient
from ..config import settings


router = APIRouter()


class NonverbalMetrics(BaseModel):
    """Nonverbal communication metrics."""
    eye_contact_score: float
    posture_score: float
    gesture_score: float


class VerbalFeedback(BaseModel):
    """Verbal communication feedback."""
    transcript: str
    clarity: str
    grammar: str
    phrasing: str
    fillerWords: str
    exampleSentence: str
    followUp: str


class CompleteAnalysisResponse(BaseModel):
    """Complete analysis response with both nonverbal and verbal feedback."""
    nonverbal: NonverbalMetrics
    verbal: VerbalFeedback | None
    combined_feedback: str
    voice_audio: str | None  # Base64 audio of coaching feedback
    frame_count: int
    video_duration: float | None
    verbal_analysis_error: str | None


@router.post("/analyze-complete", response_model=CompleteAnalysisResponse)
async def analyze_complete(file: UploadFile = File(...)):
    """
    Analyze video for complete communication assessment.

    Provides both:
    - Nonverbal metrics (eye contact, posture, gestures)
    - Verbal feedback (transcript, clarity, grammar, etc.)

    Args:
        file: Video file (MP4, AVI, MOV, WEBM)

    Returns:
        Complete analysis with nonverbal metrics and verbal feedback
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")

    # Read video bytes
    video_bytes = await file.read()

    # Validate size (50MB limit)
    max_size = settings.max_video_size_mb * 1024 * 1024
    if len(video_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Video file too large. Maximum size is {settings.max_video_size_mb}MB"
        )

    # Step 1: Process video for nonverbal metrics
    try:
        modal_client = ModalClient()
        metrics_result = await modal_client.process_video(video_bytes)
        nonverbal_metrics = NonverbalMetrics(
            eye_contact_score=metrics_result['metrics']['eye_contact_score'],
            posture_score=metrics_result['metrics']['posture_score'],
            gesture_score=metrics_result['metrics']['gesture_score']
        )
        frame_count = metrics_result.get('frame_count', 0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

    # Step 2: Extract audio from video
    verbal_feedback = None
    verbal_error = None

    try:
        audio_extractor = AudioExtractor()
        audio_bytes, audio_format = audio_extractor.extract_audio_from_video(video_bytes)

        # Step 3: Send audio to Node.js backend for speech analysis
        node_backend_url = "http://localhost:3000/api/transcribe"

        # Create form data with audio file
        files = {
            'audio': (f'audio.{audio_format}', io.BytesIO(audio_bytes), f'audio/{audio_format}')
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(node_backend_url, files=files)

            if response.status_code == 200:
                result = response.json()
                verbal_feedback = VerbalFeedback(
                    transcript=result.get('transcript', ''),
                    clarity=result.get('feedback', {}).get('clarity', ''),
                    grammar=result.get('feedback', {}).get('grammar', ''),
                    phrasing=result.get('feedback', {}).get('phrasing', ''),
                    fillerWords=result.get('feedback', {}).get('fillerWords', ''),
                    exampleSentence=result.get('feedback', {}).get('exampleSentence', ''),
                    followUp=result.get('feedback', {}).get('followUp', '')
                )
            else:
                verbal_error = f"Speech analysis failed with status {response.status_code}"

    except Exception as e:
        verbal_error = f"Audio extraction or speech analysis failed: {str(e)}"

    # Step 4: Generate combined coaching feedback
    llm_client = LLMClient(
        provider=settings.llm_provider,
        model=settings.llm_model,
        api_key=settings.openai_api_key or settings.anthropic_api_key
    )

    combined_feedback = await llm_client.generate_combined_feedback(
        nonverbal_metrics=nonverbal_metrics.model_dump(),
        verbal_feedback=verbal_feedback.model_dump() if verbal_feedback else None
    )

    # Step 5: Generate voice coaching (optional - graceful degradation if fails)
    voice_audio = None
    try:
        # Create a concise spoken version of the coaching feedback
        # Take first 2-3 sentences for voice synthesis (keep it brief)
        spoken_text = ". ".join(combined_feedback.split(". ")[:3]) + "."

        voice_url = "http://localhost:3000/api/voice-feedback"
        async with httpx.AsyncClient(timeout=30.0) as client:
            voice_response = await client.post(
                voice_url,
                json={"text": spoken_text}
            )

            if voice_response.status_code == 200:
                voice_result = voice_response.json()
                voice_audio = voice_result.get('audio')
    except Exception as e:
        # Voice synthesis is optional - don't fail the whole request
        print(f"Voice synthesis failed (optional feature): {str(e)}")

    return CompleteAnalysisResponse(
        nonverbal=nonverbal_metrics,
        verbal=verbal_feedback,
        combined_feedback=combined_feedback,
        voice_audio=voice_audio,
        frame_count=frame_count,
        video_duration=None,
        verbal_analysis_error=verbal_error
    )
