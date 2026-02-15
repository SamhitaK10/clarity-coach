import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ConversationModal } from "../components/conversation/ConversationModal";

interface NonverbalMetrics {
  eye_contact_score: number;
  posture_score: number;
  gesture_score: number;
  smile_score: number;
  head_stability_score: number;
  gesture_variety_score: number;
}

interface VerbalFeedback {
  transcript: string;
  clarity: string;
  grammar: string;
  phrasing: string;
  fillerWords: string;
  exampleSentence: string;
}

interface AnalysisResults {
  nonverbal: NonverbalMetrics;
  verbal: VerbalFeedback | null;
  combined_feedback: string;
  frame_count: number;
  verbal_analysis_error: string | null;
}

interface LocationState {
  results: AnalysisResults;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  // Redirect if no results
  if (!state?.results) {
    setTimeout(() => navigate('/'), 100);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)' }}>
        <p style={{ color: '#FAF5F0', fontSize: '1.5rem' }}>No results found. Redirecting...</p>
      </div>
    );
  }

  const { nonverbal, verbal, combined_feedback } = state.results;

  // Voice feedback function
  const playVoiceFeedback = async () => {
    try {
      setIsPlayingVoice(true);
      setVoiceError(null);

      const response = await fetch('/api/voice-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combined_feedback })
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();

      // Convert base64 to audio and play
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error: any) {
      console.error('Voice playback error:', error);
      setVoiceError(error.message || 'Could not play voice feedback');
      setIsPlayingVoice(false);
    }
  };

  // Calculate overall score (average of all nonverbal metrics)
  const overallScore = Math.round(
    (nonverbal.eye_contact_score +
      nonverbal.posture_score +
      nonverbal.gesture_score +
      nonverbal.smile_score +
      nonverbal.head_stability_score +
      nonverbal.gesture_variety_score) / 6
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div
      className="min-h-screen px-16 py-12"
      style={{
        background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
        fontFamily: 'Fredoka, sans-serif'
      }}
    >
      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: '#FAF5F0',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            Your Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '1.25rem',
              fontWeight: 400,
              color: '#FAF5F0',
              opacity: 0.9
            }}
          >
            Complete communication analysis
          </motion.p>
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-12"
          style={{
            backgroundColor: 'rgba(250, 245, 240, 0.15)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 40px rgba(250, 245, 240, 0.2)'
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              fontWeight: 700,
              color: getScoreColor(overallScore),
              marginBottom: '0.5rem'
            }}
          >
            {overallScore}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#FAF5F0' }}>
            {getScoreLabel(overallScore)}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 400, color: '#FAF5F0', opacity: 0.8, marginTop: '0.5rem' }}>
            Overall Communication Score
          </div>
        </motion.div>

        {/* Nonverbal Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAF5F0', marginBottom: '1.5rem' }}>
            📊 Nonverbal Communication
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Eye Contact', score: nonverbal.eye_contact_score, icon: '👁️' },
              { label: 'Posture', score: nonverbal.posture_score, icon: '🧍' },
              { label: 'Gestures', score: nonverbal.gesture_score, icon: '👋' },
              { label: 'Smile/Warmth', score: nonverbal.smile_score, icon: '😊' },
              { label: 'Head Stability', score: nonverbal.head_stability_score, icon: '🎯' },
              { label: 'Gesture Variety', score: nonverbal.gesture_variety_score, icon: '✨' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6"
                style={{
                  backgroundColor: 'rgba(250, 245, 240, 0.15)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(250, 245, 240, 0.1)'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{metric.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FAF5F0', marginBottom: '0.5rem' }}>
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: getScoreColor(metric.score),
                    marginBottom: '0.5rem'
                  }}
                >
                  {Math.round(metric.score)}
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(58, 46, 40, 0.3)' }}
                >
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${metric.score}%`,
                      backgroundColor: getScoreColor(metric.score)
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Verbal Communication */}
        {verbal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAF5F0', marginBottom: '1.5rem' }}>
              🗣️ Verbal Communication
            </h2>

            {/* Transcript */}
            <div
              className="p-8 mb-6"
              style={{
                backgroundColor: 'rgba(250, 245, 240, 0.15)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 20px rgba(250, 245, 240, 0.1)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FAF5F0', marginBottom: '1rem' }}>
                Your Speech
              </h3>
              <p style={{ fontSize: '1rem', color: '#FAF5F0', lineHeight: 1.6, opacity: 0.9 }}>
                "{verbal.transcript}"
              </p>
            </div>

            {/* Verbal Feedback Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Clarity', feedback: verbal.clarity, icon: '💡' },
                { label: 'Grammar', feedback: verbal.grammar, icon: '✍️' },
                { label: 'Phrasing', feedback: verbal.phrasing, icon: '🗣️' },
                { label: 'Filler Words', feedback: verbal.fillerWords, icon: '⚠️' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-6"
                  style={{
                    backgroundColor: 'rgba(250, 245, 240, 0.15)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(250, 245, 240, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAF5F0', marginBottom: '0.75rem' }}>
                    {item.label}
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#FAF5F0', lineHeight: 1.5, opacity: 0.85 }}>
                    {item.feedback}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Example Sentence */}
            {verbal.exampleSentence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="p-8 mt-6"
                style={{
                  backgroundColor: 'rgba(250, 245, 240, 0.15)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(250, 245, 240, 0.1)'
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FAF5F0', marginBottom: '1rem' }}>
                  ✨ Improved Example
                </h3>
                <p style={{ fontSize: '1rem', color: '#FAF5F0', lineHeight: 1.6, opacity: 0.9, fontStyle: 'italic' }}>
                  "{verbal.exampleSentence}"
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Combined AI Coaching */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="p-10"
          style={{
            backgroundColor: 'rgba(250, 245, 240, 0.2)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 40px rgba(250, 245, 240, 0.25)',
            border: '2px solid rgba(250, 245, 240, 0.3)'
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAF5F0', marginBottom: '1.5rem' }}>
            💬 Your Personal Coach Says:
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#FAF5F0', lineHeight: 1.8, opacity: 0.95, marginBottom: '1.5rem' }}>
            {combined_feedback}
          </p>

          {/* Voice Feedback Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={playVoiceFeedback}
              disabled={isPlayingVoice}
              className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-3"
              style={{
                backgroundColor: isPlayingVoice ? 'rgba(250, 245, 240, 0.3)' : '#FAF5F0',
                color: isPlayingVoice ? '#FAF5F0' : '#3A2E28',
                boxShadow: '0 4px 20px rgba(250, 245, 240, 0.3)',
                cursor: isPlayingVoice ? 'not-allowed' : 'pointer',
                opacity: isPlayingVoice ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isPlayingVoice) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(250, 245, 240, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 245, 240, 0.3)';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>
                {isPlayingVoice ? '🔊' : '🎧'}
              </span>
              {isPlayingVoice ? 'Playing...' : 'Listen to Feedback'}
            </button>
          </div>

          {voiceError && (
            <p style={{ color: '#EF4444', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              {voiceError}
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex gap-6 justify-center pb-12"
        >
          <button
            onClick={() => setIsConversationOpen(true)}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              backgroundColor: '#FAF5F0',
              color: '#3A2E28',
              boxShadow: '0 4px 20px rgba(250, 245, 240, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(250, 245, 240, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 245, 240, 0.3)';
            }}
          >
            💬 Talk to AI Coach
          </button>
          <button
            onClick={() => navigate('/recording')}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              backgroundColor: 'rgba(250, 245, 240, 0.2)',
              color: '#FAF5F0',
              border: '2px solid rgba(250, 245, 240, 0.4)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(250, 245, 240, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(250, 245, 240, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Practice Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              backgroundColor: 'rgba(250, 245, 240, 0.2)',
              color: '#FAF5F0',
              border: '2px solid rgba(250, 245, 240, 0.4)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(250, 245, 240, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(250, 245, 240, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Back to Home
          </button>
        </motion.div>
      </div>

      {/* Conversation Modal */}
      <ConversationModal
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
        analysisContext={state.results as any}
      />
    </div>
  );
}
