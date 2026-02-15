"""
Audio extraction service for extracting audio from video files.
"""
import tempfile
import os
from pathlib import Path
from typing import Tuple

from moviepy.editor import VideoFileClip


class AudioExtractor:
    """Service for extracting audio from video files."""

    @staticmethod
    def extract_audio_from_video(video_bytes: bytes) -> Tuple[bytes, str]:
        """
        Extract audio from video bytes.

        Args:
            video_bytes: Video file as bytes

        Returns:
            Tuple of (audio_bytes, format) where format is 'mp3' or 'wav'

        Raises:
            Exception: If audio extraction fails
        """
        # Create temporary files for video and audio
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as video_tmp:
            video_tmp.write(video_bytes)
            video_path = video_tmp.name

        audio_path = None

        try:
            # Extract audio using moviepy
            video_clip = VideoFileClip(video_path)

            # Check if video has audio
            if video_clip.audio is None:
                raise ValueError("Video file has no audio track")

            # Create temporary audio file
            audio_path = video_path.replace('.mp4', '.mp3')

            # Extract audio to MP3
            video_clip.audio.write_audiofile(
                audio_path,
                codec='mp3',
                verbose=False,
                logger=None
            )

            # Read audio bytes
            with open(audio_path, 'rb') as f:
                audio_bytes = f.read()

            # Close clips
            video_clip.close()

            return audio_bytes, 'mp3'

        except Exception as e:
            raise Exception(f"Failed to extract audio from video: {str(e)}")

        finally:
            # Clean up temporary files
            try:
                if os.path.exists(video_path):
                    os.remove(video_path)
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
            except Exception:
                pass  # Ignore cleanup errors
