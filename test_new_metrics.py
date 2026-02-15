"""Test new metrics calculation."""
import sys
sys.path.insert(0, 'modal_functions')

from utils import (
    calculate_smile_score,
    calculate_head_stability,
    calculate_gesture_variety,
    convert_to_scores
)

# Mock landmark classes
class MockLandmark:
    def __init__(self, x, y, z=0):
        self.x = x
        self.y = y
        self.z = z

class MockLandmarks:
    def __init__(self, landmarks_dict):
        self.landmark = landmarks_dict

# Test data
def create_test_data():
    """Create mock landmark data for testing."""

    # Face landmarks (simulate smiling)
    face_landmarks = []
    for i in range(100):
        landmarks = {}
        # Mouth corners: 61 (left), 291 (right)
        # Upper lip: 13, Lower lip: 14

        # Simulate smile in 70% of frames
        if i < 70:
            # Smile: corners lifted
            landmarks[61] = MockLandmark(0.3, 0.55)  # Left corner
            landmarks[291] = MockLandmark(0.7, 0.55)  # Right corner
            landmarks[13] = MockLandmark(0.5, 0.58)   # Upper lip
            landmarks[14] = MockLandmark(0.5, 0.62)   # Lower lip
        else:
            # Neutral
            landmarks[61] = MockLandmark(0.3, 0.60)
            landmarks[291] = MockLandmark(0.7, 0.60)
            landmarks[13] = MockLandmark(0.5, 0.58)
            landmarks[14] = MockLandmark(0.5, 0.62)

        face_landmarks.append(MockLandmarks(landmarks))

    # Pose landmarks (simulate stable head)
    pose_landmarks = []
    for i in range(100):
        landmarks = {}
        # Nose: 0
        # Add slight random movement (stable head)
        noise = (i % 10) * 0.001
        landmarks[0] = MockLandmark(0.5 + noise, 0.3 + noise)

        # Shoulders and hips (for testing)
        landmarks[11] = MockLandmark(0.3, 0.5)  # Left shoulder
        landmarks[12] = MockLandmark(0.7, 0.5)  # Right shoulder
        landmarks[23] = MockLandmark(0.3, 0.8)  # Left hip
        landmarks[24] = MockLandmark(0.7, 0.8)  # Right hip

        pose_landmarks.append(MockLandmarks(landmarks))

    # Hand landmarks (simulate varied gestures)
    hand_landmarks = []
    for i in range(100):
        # Simulate hand moving in different positions
        x = 0.3 + (i % 30) * 0.02
        y = 0.5 + (i % 20) * 0.02

        left_hand = {}
        left_hand[12] = MockLandmark(x, y)  # Middle finger tip
        left_hand[0] = MockLandmark(x, y + 0.1)  # Wrist

        hand_landmarks.append({
            'left': MockLandmarks(left_hand),
            'right': None
        })

    return face_landmarks, pose_landmarks, hand_landmarks

def test_new_metrics():
    """Test the three new metrics."""
    print("Creating test data...")
    face_landmarks, pose_landmarks, hand_landmarks = create_test_data()

    print("\n" + "="*60)
    print("TESTING NEW METRICS")
    print("="*60)

    # Test 1: Smile Score
    print("\n1. SMILE SCORE")
    print("-" * 40)
    smile_ratio = calculate_smile_score(face_landmarks)
    print(f"Raw smile ratio: {smile_ratio:.3f}")
    print(f"Expected: ~0.70 (70% of frames smiling)")
    print(f"[PASS]" if 0.65 <= smile_ratio <= 0.75 else "[FAIL]")

    # Test 2: Head Stability
    print("\n2. HEAD STABILITY")
    print("-" * 40)
    head_movement = calculate_head_stability(pose_landmarks)
    print(f"Raw head movement: {head_movement:.4f}")
    print(f"Expected: <0.002 (stable head)")
    print(f"[PASS]" if head_movement < 0.002 else "[FAIL]")

    # Test 3: Gesture Variety
    print("\n3. GESTURE VARIETY")
    print("-" * 40)
    gesture_spread = calculate_gesture_variety(hand_landmarks)
    print(f"Raw gesture spread: {gesture_spread:.3f}")
    print(f"Expected: >0.1 (varied gestures)")
    print(f"[PASS]" if gesture_spread > 0.1 else "[FAIL]")

    # Test 4: Convert to scores
    print("\n4. CONVERT TO SCORES (0-100)")
    print("-" * 40)

    # Use mock values for basic metrics
    eye_contact_ratio = 0.85
    avg_torso_length = 0.35
    avg_hand_motion = 0.02

    scores = convert_to_scores(
        eye_contact_ratio,
        avg_torso_length,
        avg_hand_motion,
        smile_ratio,
        head_movement,
        gesture_spread
    )

    print(f"\nAll Scores (0-100):")
    print(f"  Eye Contact:      {scores['eye_contact_score']}")
    print(f"  Posture:          {scores['posture_score']}")
    print(f"  Gesture Activity: {scores['gesture_score']}")
    print(f"  Smile:            {scores['smile_score']} (NEW)")
    print(f"  Head Stability:   {scores['head_stability_score']} (NEW)")
    print(f"  Gesture Variety:  {scores['gesture_variety_score']} (NEW)")

    print("\n" + "="*60)
    print("[SUCCESS] All metrics calculated successfully!")
    print("="*60)

if __name__ == "__main__":
    test_new_metrics()
