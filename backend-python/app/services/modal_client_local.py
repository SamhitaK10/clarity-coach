"""
Local video processing client (no Modal required).
Uses local MediaPipe processing instead of Modal GPU.
"""
from typing import Dict
import sys
from pathlib import Path
import cv2
import mediapipe as mp

# Add modal_functions to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root / "modal_functions"))

from utils import (
    calculate_eye_contact_ratio,
    calculate_avg_torso_length,
    calculate_avg_hand_motion,
    calculate_smile_score,
    calculate_head_stability,
    calculate_gesture_variety,
    convert_to_scores
)


class ModalClient:
    """Client for local video processing (Modal not required)."""

    def __init__(self):
        """Initialize local processing client."""
        pass

    async def process_video(self, video_bytes: bytes) -> Dict:
        """
        Process video locally without Modal.

        Args:
            video_bytes: Raw video file bytes

        Returns:
            Dictionary with metrics, raw_features, frame_count, and optional error
        """
        try:
            # Initialize MediaPipe Holistic
            mp_holistic = mp.solutions.holistic
            holistic = mp_holistic.Holistic(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                enable_segmentation=False,
                refine_face_landmarks=True,  # Enable iris tracking for eye contact!
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )

            # Write video bytes to temp file
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
                tmp_file.write(video_bytes)
                temp_path = tmp_file.name

            # Open video
            cap = cv2.VideoCapture(temp_path)

            if not cap.isOpened():
                os.unlink(temp_path)
                return {
                    'error': 'Failed to open video file',
                    'metrics': None,
                    'raw_features': None,
                    'frame_count': 0
                }

            # Storage for landmarks
            face_landmarks_list = []
            pose_landmarks_list = []
            hand_landmarks_list = []

            frame_count = 0
            max_frames = 3000

            print(f"[LOCAL] Processing video with MediaPipe...")

            while cap.isOpened() and frame_count < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_count += 1

                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Process with MediaPipe
                results = holistic.process(rgb_frame)

                # Store landmarks
                face_landmarks_list.append(results.face_landmarks)
                pose_landmarks_list.append(results.pose_landmarks)
                hand_landmarks_list.append({
                    'left': results.left_hand_landmarks,
                    'right': results.right_hand_landmarks
                })

                if frame_count % 30 == 0:
                    print(f"[LOCAL] Processed {frame_count} frames...")

            cap.release()
            holistic.close()
            os.unlink(temp_path)

            print(f"[LOCAL] Completed processing {frame_count} frames")

            # Calculate basic metrics
            eye_contact_ratio = calculate_eye_contact_ratio(face_landmarks_list)
            avg_torso_length = calculate_avg_torso_length(pose_landmarks_list)
            avg_hand_motion = calculate_avg_hand_motion(hand_landmarks_list)

            # Calculate new metrics
            smile_ratio = calculate_smile_score(face_landmarks_list)
            head_stability_movement = calculate_head_stability(pose_landmarks_list)
            gesture_variety_spread = calculate_gesture_variety(hand_landmarks_list)

            print(f"[LOCAL] Calculated raw features:")
            print(f"  - Eye contact ratio: {eye_contact_ratio:.3f}")
            print(f"  - Torso length: {avg_torso_length:.3f}")
            print(f"  - Hand motion: {avg_hand_motion:.4f}")
            print(f"  - Smile ratio: {smile_ratio:.3f}")
            print(f"  - Head stability: {head_stability_movement:.4f}")
            print(f"  - Gesture variety: {gesture_variety_spread:.3f}")

            # Convert to scores
            scores = convert_to_scores(
                eye_contact_ratio,
                avg_torso_length,
                avg_hand_motion,
                smile_ratio,
                head_stability_movement,
                gesture_variety_spread
            )

            return {
                'metrics': scores,
                'raw_features': {
                    'eye_contact_ratio': round(float(eye_contact_ratio), 3),
                    'avg_torso_length': round(float(avg_torso_length), 3),
                    'avg_hand_motion': round(float(avg_hand_motion), 4),
                    'smile_ratio': round(float(smile_ratio), 3),
                    'head_stability_movement': round(float(head_stability_movement), 4),
                    'gesture_variety_spread': round(float(gesture_variety_spread), 3)
                },
                'frame_count': frame_count,
                'error': None
            }

        except Exception as e:
            print(f"[LOCAL] Error processing video: {str(e)}")
            import traceback
            traceback.print_exc()

            return {
                'error': f'Video processing failed: {str(e)}',
                'metrics': None,
                'raw_features': None,
                'frame_count': 0
            }


# Global client instance
modal_client = ModalClient()
