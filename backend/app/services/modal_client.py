"""
Client for calling Modal functions.
"""
import modal
from typing import Dict, Optional
import os


class ModalClient:
    """Client for interacting with Modal deployed functions."""

    def __init__(self):
        """Initialize Modal client."""
        # Modal authentication is handled via environment variables or token file
        # MODAL_TOKEN_ID and MODAL_TOKEN_SECRET
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
            # Look up the deployed Modal function
            # The function is deployed as part of the "clarity-coach-mediapipe" app
            process_fn = modal.Function.lookup("clarity-coach-mediapipe", "process_video")

            # Call the remote function
            result = process_fn.remote(video_bytes)

            return result

        except modal.exception.NotFoundError:
            raise Exception(
                "Modal function not found. Please deploy first with: "
                "modal deploy modal_functions/mediapipe_processor.py"
            )
        except Exception as e:
            raise Exception(f"Failed to call Modal function: {str(e)}")


# Global client instance
modal_client = ModalClient()
