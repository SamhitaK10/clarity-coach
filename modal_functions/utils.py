"""
Utility functions for calculating nonverbal metrics from MediaPipe landmarks.
"""
import numpy as np
from typing import List, Dict, Optional, Tuple


def calculate_distance(point1: Tuple[float, float, float], point2: Tuple[float, float, float]) -> float:
    """Calculate Euclidean distance between two 3D points."""
    return np.sqrt(sum((a - b) ** 2 for a, b in zip(point1, point2)))


def calculate_eye_contact_ratio(face_landmarks_list: List[Optional[object]]) -> float:
    """
    Calculate the ratio of frames where the person appears to be looking at the camera.

    Uses iris landmarks to estimate gaze direction. When iris centers are roughly
    centered in the eye region, we consider it as looking at the camera.

    Args:
        face_landmarks_list: List of face landmark objects from MediaPipe (one per frame)

    Returns:
        Ratio between 0 and 1 representing eye contact fraction
    """
    if not face_landmarks_list:
        return 0.0

    looking_at_camera_count = 0
    valid_frames = 0

    for landmarks in face_landmarks_list:
        if landmarks is None:
            continue

        valid_frames += 1

        # MediaPipe face mesh indices for eye region and iris
        # Left eye: outer corner (33), inner corner (133)
        # Right eye: outer corner (362), inner corner (263)
        # Left iris center: 468, Right iris center: 473

        try:
            left_eye_outer = landmarks.landmark[33]
            left_eye_inner = landmarks.landmark[133]
            left_iris = landmarks.landmark[468]

            right_eye_outer = landmarks.landmark[362]
            right_eye_inner = landmarks.landmark[263]
            right_iris = landmarks.landmark[473]

            # Calculate iris position relative to eye corners (0 = outer, 1 = inner)
            left_eye_width = abs(left_eye_outer.x - left_eye_inner.x)
            left_iris_pos = abs(left_iris.x - left_eye_outer.x) / left_eye_width if left_eye_width > 0 else 0.5

            right_eye_width = abs(right_eye_outer.x - right_eye_inner.x)
            right_iris_pos = abs(right_iris.x - right_eye_outer.x) / right_eye_width if right_eye_width > 0 else 0.5

            # Consider looking at camera if iris is centered (between 0.3 and 0.7)
            left_centered = 0.3 <= left_iris_pos <= 0.7
            right_centered = 0.3 <= right_iris_pos <= 0.7

            if left_centered and right_centered:
                looking_at_camera_count += 1

        except (IndexError, AttributeError):
            # Skip frame if landmarks are incomplete
            continue

    if valid_frames == 0:
        return 0.0

    return looking_at_camera_count / valid_frames


def calculate_avg_torso_length(pose_landmarks_list: List[Optional[object]]) -> float:
    """
    Calculate average torso length (shoulder to hip distance).

    Longer torso length suggests upright posture, shorter suggests slouching.

    Args:
        pose_landmarks_list: List of pose landmark objects from MediaPipe (one per frame)

    Returns:
        Average normalized torso length (typically 0.2-0.5 range)
    """
    if not pose_landmarks_list:
        return 0.0

    torso_lengths = []

    for landmarks in pose_landmarks_list:
        if landmarks is None:
            continue

        try:
            # MediaPipe pose landmarks indices
            # Shoulders: left (11), right (12)
            # Hips: left (23), right (24)
            left_shoulder = landmarks.landmark[11]
            right_shoulder = landmarks.landmark[12]
            left_hip = landmarks.landmark[23]
            right_hip = landmarks.landmark[24]

            # Calculate midpoints
            shoulder_mid = (
                (left_shoulder.x + right_shoulder.x) / 2,
                (left_shoulder.y + right_shoulder.y) / 2,
                (left_shoulder.z + right_shoulder.z) / 2
            )
            hip_mid = (
                (left_hip.x + right_hip.x) / 2,
                (left_hip.y + right_hip.y) / 2,
                (left_hip.z + right_hip.z) / 2
            )

            # Calculate distance
            torso_length = calculate_distance(shoulder_mid, hip_mid)
            torso_lengths.append(torso_length)

        except (IndexError, AttributeError):
            continue

    if not torso_lengths:
        return 0.0

    return np.mean(torso_lengths)


def calculate_avg_hand_motion(hand_landmarks_list: List[Dict[str, Optional[object]]]) -> float:
    """
    Calculate average hand motion (wrist displacement between frames).

    Higher values indicate more gesturing/hand movement.

    Args:
        hand_landmarks_list: List of dicts with 'left' and 'right' hand landmarks (one per frame)

    Returns:
        Average wrist displacement per frame
    """
    if len(hand_landmarks_list) < 2:
        return 0.0

    displacements = []

    # Track previous wrist positions
    prev_left_wrist = None
    prev_right_wrist = None

    for landmarks_dict in hand_landmarks_list:
        left_hand = landmarks_dict.get('left')
        right_hand = landmarks_dict.get('right')

        # Process left hand
        if left_hand is not None:
            try:
                # Wrist is landmark 0 in hand landmarks
                curr_wrist = left_hand.landmark[0]
                curr_pos = (curr_wrist.x, curr_wrist.y, curr_wrist.z)

                if prev_left_wrist is not None:
                    displacement = calculate_distance(curr_pos, prev_left_wrist)
                    displacements.append(displacement)

                prev_left_wrist = curr_pos
            except (IndexError, AttributeError):
                pass

        # Process right hand
        if right_hand is not None:
            try:
                curr_wrist = right_hand.landmark[0]
                curr_pos = (curr_wrist.x, curr_wrist.y, curr_wrist.z)

                if prev_right_wrist is not None:
                    displacement = calculate_distance(curr_pos, prev_right_wrist)
                    displacements.append(displacement)

                prev_right_wrist = curr_pos
            except (IndexError, AttributeError):
                pass

    if not displacements:
        return 0.0

    return np.mean(displacements)


def convert_to_scores(eye_contact_ratio: float, avg_torso_length: float, avg_hand_motion: float) -> Dict[str, float]:
    """
    Convert raw features to 0-100 scores.

    Args:
        eye_contact_ratio: Raw ratio (0-1) of frames with eye contact
        avg_torso_length: Raw torso length (typically 0.2-0.5)
        avg_hand_motion: Raw hand motion (typically 0.001-0.05)

    Returns:
        Dictionary with eye_contact_score, posture_score, gesture_score (all 0-100)
    """
    # Eye contact: direct mapping from ratio to percentage
    eye_contact_score = eye_contact_ratio * 100

    # Posture: normalize torso length
    # Typical range: 0.2 (slouched) to 0.5 (upright)
    # Map to 0-100 where higher = better posture
    min_torso = 0.2
    max_torso = 0.5
    normalized_torso = (avg_torso_length - min_torso) / (max_torso - min_torso)
    posture_score = np.clip(normalized_torso * 100, 0, 100)

    # Gesture: normalize hand motion
    # Typical range: 0.001 (minimal) to 0.05 (very active)
    # Map to 0-100 where moderate gesturing (0.01-0.03) scores highest
    # Too little or too much is penalized
    optimal_motion = 0.02
    if avg_hand_motion < optimal_motion:
        # Linear scaling from 0 to 100 as we approach optimal
        gesture_score = (avg_hand_motion / optimal_motion) * 100
    else:
        # Decay after optimal point
        excess = avg_hand_motion - optimal_motion
        gesture_score = max(0, 100 - (excess / 0.03) * 50)

    gesture_score = np.clip(gesture_score, 0, 100)

    return {
        'eye_contact_score': round(float(eye_contact_score), 1),
        'posture_score': round(float(posture_score), 1),
        'gesture_score': round(float(gesture_score), 1)
    }
