import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";

const processingSteps = [
  { id: 1, label: "Uploading video", duration: 1000 },
  { id: 2, label: "Analyzing posture & gestures", duration: 2000 },
  { id: 3, label: "Evaluating eye contact", duration: 2000 },
  { id: 4, label: "Transcribing speech", duration: 2000 },
  { id: 5, label: "Analyzing verbal communication", duration: 2000 },
  { id: 6, label: "Generating AI coaching", duration: 1500 },
];

const floatingWords = [
  "clarity", "confidence", "speak", "voice", "fluent", "articulate",
  "express", "communicate", "eloquent", "precise", "engage", "deliver"
];

interface LocationState {
  videoBlob: Blob;
  language: string;
}

export function ProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(true);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!state?.videoBlob) {
      setError("No video found. Please record again.");
      setTimeout(() => navigate('/recording'), 2000);
      return;
    }

    uploadAndAnalyze();

    // Cleanup interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const uploadAndAnalyze = async () => {
    try {
      const { videoBlob, language } = state;

      // Reset completion flag
      isCompletedRef.current = false;

      // Get video duration for time estimation
      const videoDuration = await getVideoDuration(videoBlob);
      // Estimate: MediaPipe ~2x video duration, audio processing ~10s, LLM ~5s
      const estimatedTotal = Math.max(videoDuration * 2 + 15, 30); // Min 30s
      setEstimatedTimeLeft(Math.round(estimatedTotal));

      // Step 1: Starting
      setCompletedSteps([1]);
      setCurrentStep(1);

      const formData = new FormData();
      formData.append('file', videoBlob, 'recording.webm');
      formData.append('language', language || 'en');

      // Track start time for accurate progress
      const startTime = Date.now();

      // Use XMLHttpRequest for upload progress tracking
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && !isCompletedRef.current) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(percentComplete);

            if (percentComplete >= 100) {
              setCompletedSteps([1, 2]);
              setCurrentStep(2);
            }
          }
        });

        // Response received
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const results = JSON.parse(xhr.responseText);
              resolve(results);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.detail || 'Analysis failed'));
            } catch {
              reject(new Error(`HTTP ${xhr.status}: Analysis failed`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', '/analyze-complete');
        xhr.send(formData);
      });

      // Progress tracking interval with time estimation
      progressIntervalRef.current = setInterval(() => {
        // Stop updating if completed
        if (isCompletedRef.current) return;

        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(Math.round(estimatedTotal - elapsed), 0);

        // Only update if remaining is positive
        if (remaining > 0) {
          setEstimatedTimeLeft(remaining);
        }

        // Update steps based on elapsed time
        const progressRatio = Math.min(elapsed / estimatedTotal, 1);

        setCompletedSteps(prev => {
          const newSteps = [...prev];
          if (progressRatio > 0.2 && !newSteps.includes(3)) {
            newSteps.push(3);
            setCurrentStep(3);
          }
          if (progressRatio > 0.4 && !newSteps.includes(4)) {
            newSteps.push(4);
            setCurrentStep(4);
          }
          if (progressRatio > 0.6 && !newSteps.includes(5)) {
            newSteps.push(5);
            setCurrentStep(5);
          }
          if (progressRatio > 0.8 && !newSteps.includes(6)) {
            newSteps.push(6);
            setCurrentStep(6);
          }
          return newSteps;
        });
      }, 500);

      // Wait for results
      const results = await uploadPromise;

      // Mark as completed and stop interval
      isCompletedRef.current = true;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Mark all complete
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
      setEstimatedTimeLeft(null); // Hide timer when done

      // Navigate to results
      setTimeout(() => {
        navigate('/results', { state: { results } });
      }, 800);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Analysis failed. Please try again.");

      // Clean up interval on error
      isCompletedRef.current = true;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setTimeout(() => navigate('/recording'), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to get video duration
  const getVideoDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(30); // Default 30s if can't determine
      video.src = URL.createObjectURL(blob);
    });
  };

  const progress = Math.min(100, (completedSteps.length / processingSteps.length) * 100);

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
            {error ? "Error" : "Processing"}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 400,
              color: '#FAF5F0',
              opacity: 0.9
            }}
          >
            {error ? error : "Analyzing your practice session"}
          </p>
        </div>

        {!error && (
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

            {/* Progress Percentage & Time Remaining */}
            <div className="text-center mt-6 space-y-2">
              <motion.span
                style={{
                  fontSize: '1.125rem',
                  color: '#FAF5F0',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  display: 'block'
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
              {estimatedTimeLeft !== null && estimatedTimeLeft > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontSize: '0.9rem',
                    color: '#FAF5F0',
                    opacity: 0.7,
                    fontWeight: 400
                  }}
                >
                  Estimated time: ~{estimatedTimeLeft}s
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <div
            className="text-center p-8 rounded-2xl"
            style={{
              backgroundColor: 'rgba(201, 79, 61, 0.2)',
              border: '2px solid rgba(201, 79, 61, 0.5)'
            }}
          >
            <p style={{ color: '#FAF5F0', fontSize: '1rem' }}>
              Redirecting back to recording...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
