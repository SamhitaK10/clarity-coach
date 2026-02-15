"""
LLM client for generating coaching feedback.
"""
from typing import Dict
import openai
import anthropic
from ..config import settings


class LLMClient:
    """Client for generating AI coaching feedback from metrics."""

    def __init__(self, provider: str = None, model: str = None, api_key: str = None):
        """Initialize LLM client based on configured provider."""
        self.provider = provider or settings.llm_provider
        self.model = model or settings.llm_model

        if self.provider == "openai":
            self.openai_client = openai.AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        elif self.provider == "anthropic":
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=api_key or settings.anthropic_api_key)

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

    async def generate_combined_feedback(self, nonverbal_metrics: Dict[str, float], verbal_feedback: Dict = None) -> str:
        """
        Generate conversational combined feedback for both nonverbal and verbal communication.

        Args:
            nonverbal_metrics: Dictionary with nonverbal scores
            verbal_feedback: Optional dictionary with verbal feedback

        Returns:
            Natural, conversational coaching feedback with follow-up question
        """
        eye_contact = nonverbal_metrics.get('eye_contact_score', 0)
        posture = nonverbal_metrics.get('posture_score', 0)
        gesture = nonverbal_metrics.get('gesture_score', 0)

        prompt = f"""You are a supportive communication coach helping someone improve their presentation skills.

NONVERBAL COMMUNICATION:
- Eye Contact: {eye_contact}/100 (camera engagement)
- Posture: {posture}/100 (upright stance)
- Gesture Activity: {gesture}/100 (hand movements)
"""

        if verbal_feedback:
            transcript = verbal_feedback.get('transcript', 'N/A')
            clarity = verbal_feedback.get('clarity', 'N/A')
            grammar = verbal_feedback.get('grammar', 'N/A')
            filler_words = verbal_feedback.get('fillerWords', 'N/A')

            prompt += f"""
VERBAL COMMUNICATION:
- What they said: "{transcript[:200]}{'...' if len(transcript) > 200 else ''}"
- Clarity: {clarity}
- Grammar: {grammar}
- Filler Words: {filler_words}
"""

        prompt += """
Write a natural, conversational coaching response that:
1. Highlights 1-2 specific strengths with genuine encouragement
2. Identifies the TOP priority area to improve (nonverbal OR verbal - pick the most impactful one)
3. Gives ONE concrete, actionable tip they can try immediately
4. Ends with a supportive follow-up question to help them practice

Keep your response:
- Conversational and warm (like you're talking to them in person)
- Concise (4-6 sentences total)
- Specific (mention their actual scores/behaviors)
- Encouraging but honest
- Natural sounding (use contractions, casual phrases)
- End with a follow-up question

Example tone: "Great eye contact! I can see you're really engaging with the camera. The main thing I'd focus on is adding more hand gestures - you're at 45/100 right now. Try using your hands to emphasize key points, like when you mention numbers or important concepts. What specific part of your message could you emphasize with a gesture next time?"

Write your coaching response (no labels, just the natural text):"""

        try:
            if self.provider == "openai":
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert communication coach."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                return response.choices[0].message.content.strip()

            elif self.provider == "anthropic":
                response = await self.anthropic_client.messages.create(
                    model=self.model,
                    max_tokens=800,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7
                )
                return response.content[0].text.strip()

        except Exception as e:
            print(f"Combined feedback generation failed: {str(e)}")
            return self._generate_fallback_combined_feedback(nonverbal_metrics, verbal_feedback)

    def _generate_fallback_combined_feedback(self, nonverbal_metrics: Dict[str, float], verbal_feedback: Dict = None) -> str:
        """Fallback conversational feedback if LLM fails."""
        eye_contact = nonverbal_metrics.get('eye_contact_score', 0)
        posture = nonverbal_metrics.get('posture_score', 0)
        gesture = nonverbal_metrics.get('gesture_score', 0)

        # Find the strongest and weakest areas
        scores = [
            (eye_contact, "eye contact", "looking at the camera"),
            (posture, "posture", "sitting/standing upright"),
            (gesture, "hand gestures", "using hand movements")
        ]
        scores.sort(reverse=True, key=lambda x: x[0])
        strongest = scores[0]
        weakest = scores[-1]

        # Build conversational feedback
        feedback = f"Nice work on your {strongest[1]} - you scored {strongest[0]:.0f}/100! "

        if weakest[0] < 60:
            feedback += f"The main area to focus on is {weakest[1]}, where you're at {weakest[0]:.0f}/100. "
            feedback += f"Try {weakest[2]} more consistently during your next practice. "

        if verbal_feedback:
            if verbal_feedback.get('clarity'):
                feedback += f"Verbally, {verbal_feedback['clarity']} "

        feedback += "What aspect would you like to work on first in your next recording?"

        return feedback


# Global client instance
llm_client = LLMClient()
