"""
Client for calling Modal functions.
"""
from typing import Dict
import sys
from pathlib import Path

# Add modal_functions to Python path to import the Modal app
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root / "modal_functions"))

# Import the Modal app and function directly
try:
    from mediapipe_processor import app, process_video
except ImportError as e:
    raise ImportError(
        f"Failed to import Modal function. Make sure modal_functions/ is accessible. Error: {e}"
    )


class ModalClient:
    """Client for interacting with Modal deployed functions."""

    def __init__(self):
        """Initialize Modal client."""
        # Modal authentication is handled via CLI (modal token new)
        # No additional setup needed
        pass

    async def process_video(self, video_bytes: bytes) -> Dict:
        """
        Call the Modal video processing function.

        Args:
            video_bytes: Raw video file bytes

        Returns:
            Dictionary with metrics, raw_features, frame_count, and optional error

        Raises:
            Exception: If Modal function call fails
        """
        try:
            # Call the Modal function directly using .remote()
            # This uses the deployed function on Modal's infrastructure
            result = process_video.remote(video_bytes)

            return result

        except AttributeError:
            raise Exception(
                "Modal function not deployed. Please deploy first with: "
                "modal deploy modal_functions/mediapipe_processor.py"
            )
        except Exception as e:
            raise Exception(f"Failed to call Modal function: {str(e)}")


# Global client instance
modal_client = ModalClient()
