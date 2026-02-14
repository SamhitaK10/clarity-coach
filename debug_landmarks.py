"""
Debug script to investigate MediaPipe landmark detection.
Shows what's being detected and why scores might be 0.
"""
import sys
import io

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import cv2
import mediapipe as mp
from pathlib import Path
import numpy as np

# Find video
videos_dir = Path("videos")
video_files = list(videos_dir.glob("*.mp4")) + list(videos_dir.glob("*.avi"))
if not video_files:
    print("No video found!")
    exit(1)

video_path = str(video_files[0])
print(f"Analyzing: {video_path}\n")

# Initialize MediaPipe
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Open video
cap = cv2.VideoCapture(video_path)

# Diagnostic counters
total_frames = 0
frames_with_face = 0
frames_with_pose = 0
frames_with_left_hand = 0
frames_with_right_hand = 0
frames_with_iris = 0

# Sample landmarks from first few frames
print("="*60)
print("LANDMARK DETECTION ANALYSIS")
print("="*60)
print()

while cap.isOpened() and total_frames < 100:
    ret, frame = cap.read()
    if not ret:
        break

    total_frames += 1
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(rgb_frame)

    # Check what's detected
    if results.face_landmarks:
        frames_with_face += 1

        # Check if iris landmarks exist
        try:
            # Try to access iris landmarks
            if len(results.face_landmarks.landmark) > 468:
                iris_left = results.face_landmarks.landmark[468]
                iris_right = results.face_landmarks.landmark[473]
                frames_with_iris += 1
        except:
            pass

    if results.pose_landmarks:
        frames_with_pose += 1

    if results.left_hand_landmarks:
        frames_with_left_hand += 1

    if results.right_hand_landmarks:
        frames_with_right_hand += 1

    # Print detailed info for first frame
    if total_frames == 1:
        print("FIRST FRAME ANALYSIS:")
        print("-" * 60)

        if results.face_landmarks:
            num_face_landmarks = len(results.face_landmarks.landmark)
            print(f"✓ Face detected: {num_face_landmarks} landmarks")

            # Check iris landmarks
            if num_face_landmarks > 468:
                print(f"  ✓ Iris landmarks available (indices 468-477)")
                left_iris = results.face_landmarks.landmark[468]
                right_iris = results.face_landmarks.landmark[473]
                print(f"    Left iris: ({left_iris.x:.3f}, {left_iris.y:.3f})")
                print(f"    Right iris: ({right_iris.x:.3f}, {right_iris.y:.3f})")
            else:
                print(f"  ✗ Iris landmarks NOT available (only {num_face_landmarks} landmarks)")
                print(f"    Need 478 landmarks for iris tracking")
        else:
            print("✗ No face detected")

        print()

        if results.pose_landmarks:
            print("✓ Pose detected: 33 landmarks")
            # Check torso landmarks
            left_shoulder = results.pose_landmarks.landmark[11]
            left_hip = results.pose_landmarks.landmark[23]
            print(f"  Left shoulder: ({left_shoulder.x:.3f}, {left_shoulder.y:.3f})")
            print(f"  Left hip: ({left_hip.x:.3f}, {left_hip.y:.3f})")
        else:
            print("✗ No pose detected")

        print()

        if results.left_hand_landmarks:
            print("✓ Left hand detected: 21 landmarks")
            wrist = results.left_hand_landmarks.landmark[0]
            print(f"  Wrist: ({wrist.x:.3f}, {wrist.y:.3f})")
        else:
            print("✗ No left hand detected")

        if results.right_hand_landmarks:
            print("✓ Right hand detected: 21 landmarks")
            wrist = results.right_hand_landmarks.landmark[0]
            print(f"  Wrist: ({wrist.x:.3f}, {wrist.y:.3f})")
        else:
            print("✗ No right hand detected")

        print()

cap.release()
holistic.close()

# Print summary
print("="*60)
print("DETECTION SUMMARY (First 100 frames)")
print("="*60)
print(f"Total frames analyzed: {total_frames}")
print()
print(f"Face detection:       {frames_with_face}/{total_frames} ({frames_with_face/total_frames*100:.1f}%)")
print(f"  - With iris data:   {frames_with_iris}/{total_frames} ({frames_with_iris/total_frames*100 if total_frames > 0 else 0:.1f}%)")
print(f"Pose detection:       {frames_with_pose}/{total_frames} ({frames_with_pose/total_frames*100:.1f}%)")
print(f"Left hand detection:  {frames_with_left_hand}/{total_frames} ({frames_with_left_hand/total_frames*100:.1f}%)")
print(f"Right hand detection: {frames_with_right_hand}/{total_frames} ({frames_with_right_hand/total_frames*100:.1f}%)")
print()

print("="*60)
print("DIAGNOSIS")
print("="*60)

if frames_with_iris == 0:
    print("⚠️  EYE CONTACT SCORE = 0")
    print("   Reason: No iris landmarks detected")
    print("   Possible causes:")
    print("   - MediaPipe face mesh doesn't include iris by default")
    print("   - Need to use FaceMesh with refine_landmarks=True")
    print("   - Or use separate iris tracking model")

if frames_with_left_hand == 0 and frames_with_right_hand == 0:
    print("\n⚠️  GESTURE SCORE = 0")
    print("   Reason: No hand landmarks detected")
    print("   Possible causes:")
    print("   - Hands not visible in frame")
    print("   - Hands too far from camera")
    print("   - Hands moving too fast")

if frames_with_pose > 0:
    print("\n✓  POSTURE SCORE = 100")
    print("   Reason: Good torso detection")
    print("   Pose landmarks are working correctly")

print()
print("="*60)
