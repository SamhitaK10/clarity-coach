import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { transcribeAudio, analyzeTranscript, AnalysisResponse, APIError } from "../../services/api";

const processingSteps = [
  { id: 1, label: "Uploading audio", phase: 'upload' },
  { id: 2, label: "Transcribing speech", phase: 'transcribe' },
  { id: 3, label: "Analyzing performance", phase: 'analyze' },
  { id: 4, label: "Generating insights", phase: 'finalize' },
];

const floatingWords = [
  "clarity", "confidence", "speak", "voice", "fluent", "articulate", 
  "express", "communicate", "eloquent", "precise", "engage", "deliver"
];

export function ProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const audioBlob = location.state?.audioBlob as Blob | undefined;

    if (!audioBlob) {
      setError('No audio recording found. Please record again.');
      setTimeout(() => navigate('/record'), 2000);
      return;
    }

    processAudio(audioBlob);
  }, [location.state, navigate]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('📤 Starting audio processing...', audioBlob.size, 'bytes');

      // Step 1: Uploading (show immediately)
      setCurrentStep(0);
      setCompletedSteps([]);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Transcribing
      console.log('🎤 Starting transcription...');
      setCurrentStep(1);
      setCompletedSteps([1]);

      const transcribeResponse = await transcribeAudio(audioBlob);
      console.log('✅ Transcription complete:', transcribeResponse.transcript);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Analyzing
      console.log('🧠 Starting analysis...');
      setCurrentStep(2);
      setCompletedSteps([1, 2]);

      const analysisResponse = await analyzeTranscript(transcribeResponse.transcript);
      console.log('✅ Analysis complete:', analysisResponse);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Finalizing
      console.log('✨ Finalizing results...');
      setCurrentStep(3);
      setCompletedSteps([1, 2, 3]);
      setAnalysisResults(analysisResponse);

      await new Promise(resolve => setTimeout(resolve, 800));
      setCompletedSteps([1, 2, 3, 4]);

      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🚀 Navigating to results...');
      navigate('/results', { state: { results: analysisResponse } });
    } catch (err) {
      console.error('❌ Processing error:', err);
      if (err instanceof APIError) {
        setError(`Failed during ${err.endpoint}: ${err.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      setTimeout(() => navigate('/record'), 3000);
    }
  };

  // More accurate progress: include current step as 50% complete
  const progress = currentStep < processingSteps.length
    ? ((completedSteps.length + 0.5) / processingSteps.length) * 100
    : (completedSteps.length / processingSteps.length) * 100;

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-16"
      style={{ 
        background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
        fontFamily: 'Fredoka, sans-serif' 
      }}
    >
      <div className="max-w-[600px] w-full">
        <div className="text-center mb-20">
          <h1
            className="tracking-tight"
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              color: '#FAF5F0',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '1rem'
            }}
          >
            {error ? 'Error' : 'Processing'}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 400,
              color: '#FAF5F0',
              opacity: 0.9
            }}
          >
            {error || 'Analyzing your practice session'}
          </p>
        </div>

        <motion.div 
          className="p-16"
          style={{ 
            backgroundColor: 'rgba(250, 245, 240, 0.15)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 40px rgba(250, 245, 240, 0.2), inset 0 0 60px rgba(250, 245, 240, 0.1)'
          }}
          animate={{
            boxShadow: [
              '0 0 40px rgba(250, 245, 240, 0.2), inset 0 0 60px rgba(250, 245, 240, 0.1)',
              '0 0 50px rgba(250, 245, 240, 0.3), inset 0 0 60px rgba(250, 245, 240, 0.15)',
              '0 0 40px rgba(250, 245, 240, 0.2), inset 0 0 60px rgba(250, 245, 240, 0.1)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="space-y-8 mb-12">
            {processingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === index && !isCompleted;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: isCompleted || isActive ? 1 : 0.3 }}
                  className="flex items-center gap-4"
                >
                  <div
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      backgroundColor: isCompleted ? '#FF6B5A' : isActive ? '#FAF5F0' : 'rgba(250, 245, 240, 0.3)',
                      transition: 'all 0.3s ease',
                      borderRadius: '50%',
                      boxShadow: isCompleted || isActive ? '0 0 10px rgba(255, 107, 90, 0.6)' : 'none'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: isCompleted || isActive ? 600 : 400,
                      color: '#FAF5F0',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Fluid Word Wave Loading Animation */}
          <div className="relative h-32 mb-6 overflow-hidden">
            {/* Flowing words that move across */}
            <div className="absolute inset-0 flex items-center">
              {floatingWords.map((word, index) => {
                const delay = (index * 0.8) % 4;
                const yOffset = (index % 3) * 30;
                
                return (
                  <motion.div
                    key={`${word}-${index}`}
                    className="absolute whitespace-nowrap"
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 500,
                      color: '#C94F3D',
                      opacity: 0.15
                    }}
                    initial={{ 
                      x: '-100%', 
                      y: yOffset
                    }}
                    animate={{ 
                      x: '600%',
                      y: yOffset,
                      opacity: [0.1, 0.3, 0.3, 0.1]
                    }}
                    transition={{
                      duration: 4,
                      delay: delay,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {word}
                  </motion.div>
                );
              })}
            </div>

            {/* Fluid wave progress bar */}
            <div className="absolute bottom-8 left-0 right-0">
              <div 
                className="h-4 overflow-hidden relative"
                style={{ 
                  backgroundColor: 'rgba(58, 46, 40, 0.1)',
                  borderRadius: '999px'
                }}
              >
                <motion.div
                  className="h-full relative"
                  style={{
                    background: 'linear-gradient(90deg, #FF7A25, #F19D4F, #C94F3D, #FF7A25)',
                    backgroundSize: '300% 100%',
                    borderRadius: '999px'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '100% 0%']
                  }}
                  transition={{ 
                    width: { duration: 0.5, ease: "easeOut" },
                    backgroundPosition: { 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }
                  }}
                >
                  {/* Liquid ripple effect */}
                  <motion.div
                    className="absolute right-0 h-full w-12"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4), transparent)',
                      borderRadius: '999px'
                    }}
                    animate={{
                      scaleX: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="text-center mt-6">
            <motion.span 
              style={{ 
                fontSize: '1.125rem', 
                color: '#FAF5F0', 
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}