"""
LLM client for generating coaching feedback.
"""
from typing import Dict
import openai
import anthropic
from ..config import settings


class LLMClient:
    """Client for generating AI coaching feedback from metrics."""

    def __init__(self):
        """Initialize LLM client based on configured provider."""
        self.provider = settings.llm_provider
        self.model = settings.llm_model

        if self.provider == "openai":
            self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        elif self.provider == "anthropic":
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    def _create_coaching_prompt(self, metrics: Dict[str, float]) -> str:
        """
        Create a coaching prompt based on the metrics.

        Args:
            metrics: Dictionary with eye_contact_score, posture_score, gesture_score

        Returns:
            Formatted prompt for the LLM
        """
        eye_contact = metrics['eye_contact_score']
        posture = metrics['posture_score']
        gesture = metrics['gesture_score']

        prompt = f"""You are a professional communication coach analyzing a workplace video presentation.

The speaker's nonverbal communication metrics are:
- Eye Contact: {eye_contact}/100 (percentage of time maintaining camera eye contact)
- Posture: {posture}/100 (upright posture quality)
- Gesture Activity: {gesture}/100 (hand movement appropriateness)

Provide 3-5 specific, actionable coaching suggestions to improve their presentation skills. Focus on:
1. What they're doing well (if any scores are above 70)
2. Specific areas for improvement (if any scores are below 60)
3. Practical tips they can implement immediately

Keep your feedback:
- Constructive and encouraging
- Specific (not generic advice)
- Actionable (concrete steps they can take)
- Brief (3-5 bullet points, 2-3 sentences each)
- Bias-aware (recognize cultural differences in communication norms)

Format your response as clear bullet points."""

        return prompt

    async def generate_feedback(self, metrics: Dict[str, float]) -> str:
        """
        Generate coaching feedback from metrics using LLM.

        Args:
            metrics: Dictionary with eye_contact_score, posture_score, gesture_score

        Returns:
            Generated coaching feedback text

        Raises:
            Exception: If LLM call fails
        """
        try:
            prompt = self._create_coaching_prompt(metrics)

            if self.provider == "openai":
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert communication coach providing constructive feedback."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content.strip()

            elif self.provider == "anthropic":
                response = await self.anthropic_client.messages.create(
                    model=self.model,
                    max_tokens=500,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7
                )
                return response.content[0].text.strip()

            else:
                raise ValueError(f"Unknown LLM provider: {self.provider}")

        except Exception as e:
            # Return fallback feedback if LLM fails
            print(f"LLM generation failed: {str(e)}")
            return self._generate_fallback_feedback(metrics)

    def _generate_fallback_feedback(self, metrics: Dict[str, float]) -> str:
        """
        Generate basic rule-based feedback if LLM fails.

        Args:
            metrics: Dictionary with scores

        Returns:
            Simple feedback based on thresholds
        """
        feedback_points = []

        eye_contact = metrics['eye_contact_score']
        posture = metrics['posture_score']
        gesture = metrics['gesture_score']

        # Eye contact feedback
        if eye_contact >= 70:
            feedback_points.append("✓ **Strong eye contact**: You maintain good camera engagement.")
        elif eye_contact >= 40:
            feedback_points.append("• **Eye contact**: Try to look directly at the camera more consistently.")
        else:
            feedback_points.append("• **Eye contact**: Focus on looking at the camera lens, not the screen.")

        # Posture feedback
        if posture >= 70:
            feedback_points.append("✓ **Good posture**: You maintain an upright, confident stance.")
        elif posture >= 40:
            feedback_points.append("• **Posture**: Try to sit or stand more upright to project confidence.")
        else:
            feedback_points.append("• **Posture**: Work on maintaining better posture throughout.")

        # Gesture feedback
        if gesture >= 70:
            feedback_points.append("✓ **Natural gestures**: Your hand movements enhance your message.")
        elif gesture >= 40:
            feedback_points.append("• **Gestures**: Consider using more hand gestures to emphasize key points.")
        else:
            feedback_points.append("• **Gestures**: Try to use moderate hand gestures for emphasis.")

        return "\n\n".join(feedback_points)


# Global client instance
llm_client = LLMClient()
