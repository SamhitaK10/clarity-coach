"""
Test script to run a video through the Clarity Coach system locally.
This tests the MediaPipe processing without needing Modal deployment.
"""
import sys
import os
from pathlib import Path

# Fix Windows console encoding issues
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add modal_functions to path
sys.path.insert(0, str(Path(__file__).parent / "modal_functions"))

# Import the processing functions
from utils import (
    calculate_eye_contact_ratio,
    calculate_avg_torso_length,
    calculate_avg_hand_motion,
    convert_to_scores
)

import cv2
import mediapipe as mp


def process_video_local(video_path: str):
    """Process video locally without Modal."""
    print(f"Processing video: {video_path}")
    print("=" * 60)

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

    # Open video
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"[ERROR] Failed to open video: {video_path}")
        return None

    # Get video info
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"[VIDEO INFO]")
    print(f"   FPS: {fps:.2f}")
    print(f"   Total Frames: {total_frames}")
    print(f"   Duration: {duration:.2f} seconds")
    print()

    # Storage for landmarks
    face_landmarks_list = []
    pose_landmarks_list = []
    hand_landmarks_list = []

    frame_count = 0

    print("[PROCESSING] Analyzing frames...")
    while cap.isOpened():
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

        # Progress indicator
        if frame_count % 30 == 0:
            progress = (frame_count / total_frames) * 100
            print(f"   {frame_count}/{total_frames} frames ({progress:.1f}%)")

    cap.release()
    holistic.close()

    print(f"[COMPLETE] Processed {frame_count} frames")
    print()

    # Calculate metrics
    print("[METRICS] Calculating scores...")
    eye_contact_ratio = calculate_eye_contact_ratio(face_landmarks_list)
    avg_torso_length = calculate_avg_torso_length(pose_landmarks_list)
    avg_hand_motion = calculate_avg_hand_motion(hand_landmarks_list)

    print(f"   Eye Contact Ratio: {eye_contact_ratio:.3f}")
    print(f"   Avg Torso Length: {avg_torso_length:.3f}")
    print(f"   Avg Hand Motion: {avg_hand_motion:.4f}")
    print()

    # Convert to scores
    scores = convert_to_scores(eye_contact_ratio, avg_torso_length, avg_hand_motion)

    # Display results
    print("=" * 60)
    print("RESULTS")
    print("=" * 60)
    print()
    print(f"Eye Contact Score:  {scores['eye_contact_score']:.1f}/100")
    print(f"Posture Score:      {scores['posture_score']:.1f}/100")
    print(f"Gesture Score:      {scores['gesture_score']:.1f}/100")
    print()
    print("=" * 60)

    return {
        'metrics': scores,
        'raw_features': {
            'eye_contact_ratio': eye_contact_ratio,
            'avg_torso_length': avg_torso_length,
            'avg_hand_motion': avg_hand_motion
        },
        'frame_count': frame_count
    }


if __name__ == "__main__":
    # Find the first video in the videos folder
    videos_dir = Path("videos")

    if not videos_dir.exists():
        print("[ERROR] videos/ folder not found")
        sys.exit(1)

    # Find first video file
    video_files = list(videos_dir.glob("*.mp4")) + list(videos_dir.glob("*.avi")) + \
                  list(videos_dir.glob("*.mov")) + list(videos_dir.glob("*.webm"))

    if not video_files:
        print("[ERROR] No video files found in videos/ folder")
        print("Supported formats: .mp4, .avi, .mov, .webm")
        sys.exit(1)

    video_path = str(video_files[0])
    print(f"[INFO] Using video: {video_path}")
    print()

    result = process_video_local(video_path)

    if result:
        print("\n[SUCCESS] Test completed successfully!")
        print("\nNext steps:")
        print("1. If metrics look good, deploy to Modal: modal deploy modal_functions/mediapipe_processor.py")
        print("2. Add your OpenAI API key to .env")
        print("3. Start the backend: cd backend && uvicorn app.main:app --reload")
    else:
        print("\n[ERROR] Test failed!")
