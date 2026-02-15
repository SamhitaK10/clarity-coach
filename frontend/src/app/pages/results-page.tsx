import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Play, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import llamaHeadsetImage from "../../assets/ba3f08758491f6b17708870b4e0ceee5f6152335.png";
import llamaCameraSmallImage from "../../assets/df8b75e5a357924574150d9137867e0cc6eadcdf.png";
import llamaClipboardImage from "../../assets/b9e05bd423916514c179c0fe1090521fe09dab99.png";
import llamaClockImage from "../../assets/9757c4949b5c9226535773cf58040d9db20d94bc.png";
import { AnalysisResponse } from "../../services/api";
import { ConversationModal } from "../components/conversation/ConversationModal";

const mockResults = {
  overallScore: 78,
  summary: "Strong delivery with clear articulation and confident presence. Opportunities exist to refine eye contact consistency during technical explanations.",
  categoryScores: [
    {
      id: 1,
      category: "Posture",
      score: 82,
      insight: "Maintained professional bearing throughout session.",
      details: [
        "Shoulder stability: 87% of duration",
        "Minimal postural lapses: 2 instances",
        "Purposeful hand gestures maintained",
        "Consistent upright position"
      ]
    },
    {
      id: 2,
      category: "Eye Contact",
      score: 71,
      insight: "Adequate baseline with inconsistency during complex segments.",
      details: [
        "Direct focus: 71% of recording",
        "Extended breaks: 4 instances exceeding 2 seconds",
        "Strongest performance: opening 15 seconds",
        "Area for improvement: technical detail delivery"
      ]
    },
    {
      id: 3,
      category: "Clarity",
      score: 85,
      insight: "Exceptional articulation with minimal ambiguity.",
      details: [
        "Word clarity rate: 96%",
        "Volume consistency maintained",
        "Technical terms articulated precisely",
        "Single unclear phrase at 0:22 mark"
      ]
    },
    {
      id: 4,
      category: "Pacing",
      score: 75,
      insight: "Generally controlled with minor acceleration patterns.",
      details: [
        "Speaking rate: 145 WPM (optimal range)",
        "Acceleration detected: 0:18-0:28 segment",
        "Strategic pauses: 3 instances",
        "Recommendation: slower pace during achievements"
      ]
    },
  ],
  transcript: [
    { type: "normal", text: "Hi, I'm Alex Chen, a junior studying Computer Science at State University." },
    { type: "normal", text: "I'm passionate about building accessible web applications." },
    { type: "filler", text: "Um," },
    { type: "normal", text: "last summer I interned at a local startup where I helped redesign their mobile app, increasing user engagement by 40%." },
    { type: "filler", text: "Like," },
    { type: "normal", text: "I love solving complex problems with elegant solutions." },
    { type: "normal", text: "I'm seeking summer internship opportunities to contribute meaningfully while developing my skills." },
  ],
  strongMoments: [
    { 
      timestamp: "0:12", 
      timeInSeconds: 12,
      description: "Confident introduction with direct camera engagement" 
    },
    { 
      timestamp: "0:28", 
      timeInSeconds: 28,
      description: "Quantified achievement delivered with conviction" 
    },
    { 
      timestamp: "0:35", 
      timeInSeconds: 35,
      description: "Clear articulation of professional objectives" 
    },
  ],
  areasToImprove: [
    { 
      timestamp: "0:18", 
      timeInSeconds: 18,
      description: "Filler word disrupted flow" 
    },
    { 
      timestamp: "0:30", 
      timeInSeconds: 30,
      description: "Extended gaze break from camera" 
    },
    { 
      timestamp: "0:22", 
      timeInSeconds: 22,
      description: "Filler word reduced professional tone" 
    },
  ],
};

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [playingTimestamp, setPlayingTimestamp] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  useEffect(() => {
    const resultsData = location.state?.results as AnalysisResponse | undefined;

    if (!resultsData) {
      console.warn('No results found in state, using mock data');
      setResults(mockResults);
    } else {
      setResults(resultsData);
    }
  }, [location.state]);

  const handlePlayTimestamp = (timeInSeconds: number) => {
    setPlayingTimestamp(timeInSeconds);
    setTimeout(() => {
      setPlayingTimestamp(null);
    }, 3000);
  };

  if (!results) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
          fontFamily: 'Fredoka, sans-serif'
        }}
      >
        <div className="text-center">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FAF5F0' }}>
            Loading results...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
      fontFamily: 'Fredoka, sans-serif' 
    }}>
      {/* Header */}
      <header className="px-16 py-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="transition-opacity hover:opacity-70"
            style={{ color: '#FAF5F0', fontSize: '1rem', fontWeight: 500 }}
          >
            ← Home
          </button>
          <div style={{ color: '#FAF5F0', fontSize: '0.875rem', opacity: 0.7 }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-16 py-20">
        <div className="max-w-[1200px] mx-auto space-y-20">
          {/* Overall Score Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-[300px_1fr] gap-16">
              {/* Score Display */}
              <div>
                <div 
                  className="relative inline-block"
                  style={{ width: '280px', height: '280px' }}
                >
                  <svg className="absolute inset-0" viewBox="0 0 280 280" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      stroke="rgba(58, 46, 40, 0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      stroke="#C94F3D"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 130}`}
                      strokeDashoffset={`${2 * Math.PI * 130 * (1 - results.overallScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div 
                      style={{ 
                        fontSize: '5rem',
                        fontWeight: 800,
                        color: '#3A2E28',
                        lineHeight: 1,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {results.overallScore}
                    </div>
                    <div 
                      style={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: '#3A2E28',
                        opacity: 0.5,
                        marginTop: '0.5rem'
                      }}
                    >
                      / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-8">
                <p 
                  className="leading-relaxed"
                  style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 300,
                    color: '#3A2E28',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.5
                  }}
                >
                  {results.summary}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Category Scores */}
          <div className="grid grid-cols-2 gap-8">
            {results.categoryScores.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryScoreCard 
                  {...category} 
                  isExpanded={expandedCategory === category.id}
                  onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-12"
            style={{ backgroundColor: '#FAF5F0', borderRadius: '12px' }}
          >
            <h2 
              className="mb-8"
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#3A2E28',
                letterSpacing: '-0.01em'
              }}
            >
              Transcript
            </h2>
            <div className="prose max-w-none">
              <p 
                className="leading-relaxed"
                style={{ 
                  fontSize: '1.125rem',
                  fontWeight: 300,
                  color: '#3A2E28',
                  lineHeight: 1.7
                }}
              >
                {results.transcript.map((segment, index) => (
                  <span
                    key={index}
                    style={segment.type === "filler" ? {
                      backgroundColor: '#C94F3D',
                      color: '#FAF5F0',
                      padding: '0.125rem 0.375rem',
                      fontWeight: 500
                    } : {}}
                  >
                    {segment.text}{" "}
                  </span>
                ))}
              </p>
            </div>
            <div 
              className="mt-8 pt-8"
              style={{ borderTop: '1px solid rgba(58, 46, 40, 0.15)' }}
            >
              <p style={{ fontSize: '0.875rem', color: '#3A2E28', opacity: 0.6 }}>
                Filler words highlighted • 2 instances detected
              </p>
            </div>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-12"
          >
            {/* Strong Moments */}
            <div>
              <h3 
                className="mb-6"
                style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#3A2E28',
                  letterSpacing: '-0.01em'
                }}
              >
                Strong moments
              </h3>
              <div className="space-y-4">
                {results.strongMoments.map((moment, index) => (
                  <TimestampCard
                    key={index}
                    type="strong"
                    timestamp={moment.timestamp}
                    timeInSeconds={moment.timeInSeconds}
                    description={moment.description}
                    isPlaying={playingTimestamp === moment.timeInSeconds}
                    onPlay={() => handlePlayTimestamp(moment.timeInSeconds)}
                  />
                ))}
              </div>
            </div>

            {/* Areas to Improve */}
            <div>
              <h3 
                className="mb-6"
                style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#3A2E28',
                  letterSpacing: '-0.01em'
                }}
              >
                Areas for development
              </h3>
              <div className="space-y-4">
                {results.areasToImprove.map((moment, index) => (
                  <TimestampCard
                    key={index}
                    type="improve"
                    timestamp={moment.timestamp}
                    timeInSeconds={moment.timeInSeconds}
                    description={moment.description}
                    isPlaying={playingTimestamp === moment.timeInSeconds}
                    onPlay={() => handlePlayTimestamp(moment.timeInSeconds)}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-6 pt-12"
          >
            <button
              onClick={() => setIsConversationOpen(true)}
              className="px-10 py-5 transition-all hover:scale-105 flex items-center gap-3"
              style={{
                backgroundColor: '#C94F3D',
                color: '#FAF5F0',
                fontSize: '1.125rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                borderRadius: '8px',
                boxShadow: '0 0 30px rgba(201, 79, 61, 0.6)'
              }}
            >
              <MessageCircle size={24} />
              Talk to AI Coach
            </button>
            <button
              onClick={() => navigate('/record')}
              className="px-10 py-5 transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#FAF5F0',
                color: '#3A2E28',
                fontSize: '1.125rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                borderRadius: '8px'
              }}
            >
              New Practice Session
            </button>
            <button
              className="px-10 py-5 transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(58, 46, 40, 0.3)',
                color: '#3A2E28',
                fontSize: '1.125rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                borderRadius: '8px'
              }}
            >
              View History
            </button>
          </motion.div>
        </div>
      </div>

      {/* Conversation Modal */}
      <ConversationModal
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
        analysisContext={results || undefined}
      />
    </div>
  );
}

function CategoryScoreCard({ 
  category, 
  score, 
  insight,
  details,
  isExpanded,
  onToggle
}: { 
  category: string; 
  score: number; 
  insight: string;
  details: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Map category to image
  const getImage = () => {
    switch(category) {
      case "Posture":
        return llamaHeadsetImage;
      case "Eye Contact":
        return llamaCameraSmallImage;
      case "Clarity":
        return llamaClipboardImage;
      case "Pacing":
        return llamaClockImage;
      default:
        return "";
    }
  };

  return (
    <motion.div 
      className="p-8 transition-all flex flex-col"
      style={{ 
        backgroundColor: 'rgba(250, 245, 240, 0.95)',
        borderRadius: '24px',
        minHeight: '420px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 30px rgba(250, 245, 240, 0.4), inset 0 0 40px rgba(255, 122, 37, 0.1)'
      }}
      animate={{
        boxShadow: [
          '0 0 30px rgba(250, 245, 240, 0.4), inset 0 0 40px rgba(255, 122, 37, 0.1)',
          '0 0 40px rgba(250, 245, 240, 0.6), inset 0 0 50px rgba(255, 122, 37, 0.15)',
          '0 0 30px rgba(250, 245, 240, 0.4), inset 0 0 40px rgba(255, 122, 37, 0.1)'
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Title */}
      <h3 
        className="text-center mb-6"
        style={{ 
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#3A2E28',
          letterSpacing: '-0.01em'
        }}
      >
        {category}
      </h3>

      {/* Image */}
      <div 
        className="mb-6 flex items-center justify-center"
        style={{ 
          height: '160px'
        }}
      >
        <motion.img 
          src={getImage()} 
          alt={category}
          style={{ 
            maxHeight: '100%',
            width: 'auto',
            objectFit: 'contain'
          }}
          animate={{
            y: [0, -5, 0],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Score Display with Animated Progress Bar */}
      <div className="flex items-center gap-6 mb-4">
        <div 
          style={{ 
            fontSize: '3rem',
            fontWeight: 700,
            color: '#C94F3D',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            minWidth: '80px'
          }}
        >
          {score}
        </div>
        
        {/* Horizontal Animated Progress Bar */}
        <div className="flex-1 space-y-2">
          <div 
            className="h-3 overflow-hidden relative"
            style={{ 
              backgroundColor: 'rgba(58, 46, 40, 0.1)',
              borderRadius: '999px'
            }}
          >
            <motion.div
              className="h-full relative"
              style={{
                background: 'linear-gradient(90deg, #FF7A25, #F19D4F, #FF7A25)',
                backgroundSize: '200% 100%',
                borderRadius: '999px',
                boxShadow: '0 0 20px rgba(241, 157, 79, 0.6), 0 0 40px rgba(255, 122, 37, 0.4)'
              }}
              initial={{ width: '0%' }}
              animate={{ 
                width: `${score}%`,
                backgroundPosition: ['0% 0%', '100% 0%']
              }}
              transition={{ 
                width: { duration: 1.5, ease: "easeOut" },
                backgroundPosition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
            >
              {/* Glowing pulse effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
                  borderRadius: '999px'
                }}
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      <p 
        className="mb-4 flex-grow"
        style={{ 
          fontSize: '0.9375rem',
          fontWeight: 300,
          color: '#3A2E28',
          lineHeight: 1.6
        }}
      >
        {insight}
      </p>
      
      <button
        onClick={onToggle}
        className="transition-opacity hover:opacity-70 text-left"
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#3A2E28',
          textDecoration: 'underline'
        }}
      >
        {isExpanded ? 'Hide details' : 'Show details'}
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 space-y-3"
          style={{ borderTop: '1px solid rgba(58, 46, 40, 0.15)' }}
        >
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div 
                style={{
                  width: '0.375rem',
                  height: '0.375rem',
                  backgroundColor: '#C94F3D',
                  marginTop: '0.5rem',
                  flexShrink: 0
                }}
              />
              <span 
                style={{ 
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: '#3A2E28',
                  lineHeight: 1.6
                }}
              >
                {detail}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function TimestampCard({ 
  timestamp, 
  timeInSeconds,
  description, 
  isPlaying,
  onPlay,
  type
}: { 
  timestamp: string; 
  timeInSeconds: number;
  description: string; 
  isPlaying: boolean;
  onPlay: () => void;
  type?: "strong" | "improve"
}) {
  const getStyle = () => {
    if (type === "strong") {
      return {
        backgroundColor: 'rgba(134, 239, 172, 0.3)',
        boxShadow: isPlaying 
          ? '0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 40px rgba(74, 222, 128, 0.2)' 
          : '0 0 20px rgba(74, 222, 128, 0.4), inset 0 0 30px rgba(134, 239, 172, 0.15)',
        borderRadius: '20px',
        border: 'none'
      };
    } else if (type === "improve") {
      return {
        backgroundColor: 'rgba(252, 165, 165, 0.3)',
        boxShadow: isPlaying 
          ? '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 40px rgba(248, 113, 113, 0.2)' 
          : '0 0 20px rgba(248, 113, 113, 0.4), inset 0 0 30px rgba(252, 165, 165, 0.15)',
        borderRadius: '20px',
        border: 'none'
      };
    }
    return {
      backgroundColor: 'rgba(250, 245, 240, 0.15)',
      boxShadow: '0 0 20px rgba(250, 245, 240, 0.3), inset 0 0 30px rgba(255, 122, 37, 0.1)',
      borderRadius: '20px',
      border: 'none'
    };
  };

  return (
    <motion.button 
      onClick={onPlay}
      className="w-full text-left p-6 transition-all group"
      style={getStyle()}
      whileHover={{ scale: 1.02 }}
      animate={isPlaying ? {
        boxShadow: type === "strong" 
          ? [
              '0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 40px rgba(74, 222, 128, 0.2)',
              '0 0 40px rgba(34, 197, 94, 0.8), inset 0 0 50px rgba(74, 222, 128, 0.3)',
              '0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 40px rgba(74, 222, 128, 0.2)'
            ]
          : type === "improve" 
          ? [
              '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 40px rgba(248, 113, 113, 0.2)',
              '0 0 40px rgba(239, 68, 68, 0.8), inset 0 0 50px rgba(248, 113, 113, 0.3)',
              '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 40px rgba(248, 113, 113, 0.2)'
            ]
          : []
      } : {}}
      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Play 
            size={14}
            className="transition-opacity"
            style={{ 
              color: '#3A2E28',
              opacity: isPlaying ? 1 : 0.4
            }}
          />
          <span 
            style={{ 
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#3A2E28',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {timestamp}
          </span>
        </div>
        <p 
          style={{ 
            fontSize: '0.9375rem',
            fontWeight: 300,
            color: '#3A2E28',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      </div>
      {isPlaying && (
        <div 
          className="mt-4 pt-4"
          style={{ borderTop: '1px solid rgba(58, 46, 40, 0.15)' }}
        >
          <span style={{ fontSize: '0.75rem', color: '#3A2E28', opacity: 0.6 }}>
            Playing segment
          </span>
        </div>
      )}
    </motion.button>
  );
}