# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**clarity-coach** (a.k.a. **VoicePose Coach**) is an AI-powered workplace communication assistant.

Goal:  
Analyze short workplace videos (30–60s self-intros / promo pitches) to give **nonverbal feedback** on:

- Eye contact
- Posture
- Gesture activity
- (Later) Speech rate, filler words, tone

The MVP flow:

1. User records or uploads a short video in the browser.
2. Video is sent to a backend endpoint.
3. Backend forwards the video bytes to a **Modal** GPU function that runs **MediaPipe Holistic** to compute nonverbal metrics.
4. Metrics are passed to an **LLM** (OpenAI/Anthropic) to generate concrete coaching suggestions.
5. Frontend displays metrics + text feedback.

The focus is: **simple, demoable, bias-aware nonverbal coaching**, not full-blown performance review.

---

## High-Level Architecture

We are structuring work into modules so each can be implemented and iterated on separately.

### Module 1 – Metrics & API Contract

Define what we measure and the external API.

- Metrics for MVP:
  - `eye_contact_score` (0–100)
  - `posture_score` (0–100)
  - `gesture_score` (0–100)
- Derived raw features:
  - `eye_contact_ratio` – fraction of frames where the speaker appears to look at the camera.
  - `avg_torso_length` – proxy for slouch vs upright posture.
  - `avg_hand_motion` – average wrist movement per frame (proxy for gesturing).
- Main HTTP endpoint (for frontend):

**Request**: `POST /analyze` (multipart/form-data, field `file` = short video)  
**Response**:

```json
{
  "metrics": {
    "eye_contact_score": float,
    "posture_score": float,
    "gesture_score": float
  },
  "feedback": "string with bullet-point or paragraph suggestions"
}
