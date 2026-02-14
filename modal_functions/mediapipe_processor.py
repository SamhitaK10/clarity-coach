"""
Modal GPU function for processing videos with MediaPipe Holistic.

This module runs on Modal's infrastructure with GPU acceleration for fast video processing.
"""
import io
import cv2
import numpy as np
import mediapipe as mp
from typing import Dict
import modal

from utils import (
    calculate_eye_contact_ratio,
    calculate_avg_torso_length,
    calculate_avg_hand_motion,
    convert_to_scores
)

# Define Modal app
app = modal.App("clarity-coach-mediapipe")

# Create image with MediaPipe and OpenCV dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "opencv-python==4.10.0.84",
        "mediapipe==0.10.18",
        "numpy==1.26.4"
    )
    .apt_install("libgl1-mesa-glx", "libglib2.0-0")
)


@app.function(
    image=image,
    gpu="T4",  # Use T4 GPU for accelerated processing
    timeout=300,  # 5 minute timeout
    memory=2048,  # 2GB memory
)
def process_video(video_bytes: bytes) -> Dict:
    """
    Process video with MediaPipe Holistic to extract nonverbal metrics.

    Args:
        video_bytes: Raw video file bytes

    Returns:
        Dictionary with:
        - metrics: dict with eye_contact_score, posture_score, gesture_score (0-100)
        - raw_features: dict with eye_contact_ratio, avg_torso_length, avg_hand_motion
        - frame_count: number of frames processed
        - error: error message if processing failed (optional)
    """
    try:
        # Initialize MediaPipe Holistic
        mp_holistic = mp.solutions.holistic
        holistic = mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,  # Balance between accuracy and speed
            smooth_landmarks=True,
            enable_segmentation=False,
            refine_face_landmarks=True,  # Enable iris tracking for eye contact!
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Convert bytes to video
        video_array = np.frombuffer(video_bytes, dtype=np.uint8)
        temp_file = io.BytesIO(video_bytes)

        # Write to temporary file for OpenCV
        with open('/tmp/input_video.mp4', 'wb') as f:
            f.write(video_bytes)

        # Open video
        cap = cv2.VideoCapture('/tmp/input_video.mp4')

        if not cap.isOpened():
            return {
                'error': 'Failed to open video file',
                'metrics': None,
                'raw_features': None,
                'frame_count': 0
            }

        # Storage for landmarks across frames
        face_landmarks_list = []
        pose_landmarks_list = []
        hand_landmarks_list = []

        frame_count = 0
        max_frames = 3000  # Limit processing to ~100s at 30fps

        print(f"Starting video processing...")

        while cap.isOpened() and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process frame with MediaPipe Holistic
            results = holistic.process(rgb_frame)

            # Store landmarks
            face_landmarks_list.append(results.face_landmarks)
            pose_landmarks_list.append(results.pose_landmarks)
            hand_landmarks_list.append({
                'left': results.left_hand_landmarks,
                'right': results.right_hand_landmarks
            })

            # Log progress every 30 frames (~1 second)
            if frame_count % 30 == 0:
                print(f"Processed {frame_count} frames...")

        cap.release()
        holistic.close()

        print(f"Completed processing {frame_count} frames")

        # Calculate raw features
        eye_contact_ratio = calculate_eye_contact_ratio(face_landmarks_list)
        avg_torso_length = calculate_avg_torso_length(pose_landmarks_list)
        avg_hand_motion = calculate_avg_hand_motion(hand_landmarks_list)

        print(f"Raw features - Eye contact: {eye_contact_ratio:.3f}, "
              f"Torso length: {avg_torso_length:.3f}, Hand motion: {avg_hand_motion:.4f}")

        # Convert to 0-100 scores
        scores = convert_to_scores(eye_contact_ratio, avg_torso_length, avg_hand_motion)

        print(f"Scores - Eye contact: {scores['eye_contact_score']}, "
              f"Posture: {scores['posture_score']}, Gesture: {scores['gesture_score']}")

        return {
            'metrics': scores,
            'raw_features': {
                'eye_contact_ratio': round(float(eye_contact_ratio), 3),
                'avg_torso_length': round(float(avg_torso_length), 3),
                'avg_hand_motion': round(float(avg_hand_motion), 4)
            },
            'frame_count': frame_count,
            'error': None
        }

    except Exception as e:
        print(f"Error processing video: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'error': f'Video processing failed: {str(e)}',
            'metrics': None,
            'raw_features': None,
            'frame_count': 0
        }


@app.local_entrypoint()
def main(video_path: str = "test_video.mp4"):
    """
    Local entrypoint for testing the Modal function.

    Usage:
        modal run modal_functions/mediapipe_processor.py --video-path path/to/video.mp4
    """
    print(f"Testing Modal function with video: {video_path}")

    # Read video file
    with open(video_path, 'rb') as f:
        video_bytes = f.read()

    print(f"Video size: {len(video_bytes) / (1024*1024):.2f} MB")

    # Call the Modal function
    result = process_video.remote(video_bytes)

    # Display results
    print("\n" + "="*60)
    print("RESULTS")
    print("="*60)

    if result.get('error'):
        print(f"❌ Error: {result['error']}")
    else:
        print(f"✓ Processed {result['frame_count']} frames")
        print("\nRaw Features:")
        for key, value in result['raw_features'].items():
            print(f"  {key}: {value}")

        print("\nMetrics (0-100 scores):")
        metrics = result['metrics']
        print(f"  Eye Contact: {metrics['eye_contact_score']}")
        print(f"  Posture: {metrics['posture_score']}")
        print(f"  Gesture: {metrics['gesture_score']}")

    print("="*60)
