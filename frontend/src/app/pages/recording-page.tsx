import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Circle } from "lucide-react";
import llamaCameraImage from "figma:asset/095527c69f28e54d29724a279622c46c51a349da.png";
import { motion } from "motion/react";

export function RecordingPage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isRecording && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isRecording && countdown === 0) {
      handleStopRecording();
    }
  }, [isRecording, countdown]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setHasStarted(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setTimeout(() => {
      navigate('/processing');
    }, 500);
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
        fontFamily: 'Fredoka, sans-serif'
      }}
    >
      {/* Header */}
      <header className="px-16 py-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="transition-opacity hover:opacity-70"
            style={{ color: '#FAF5F0', fontSize: '1rem', fontWeight: 500 }}
          >
            ← Back
          </button>
          
          {/* Countdown Timer */}
          {hasStarted && (
            <div className="flex items-center gap-4">
              <span style={{ color: '#FAF5F0', fontSize: '0.875rem', fontWeight: 500 }}>
                Time remaining
              </span>
              <motion.div 
                className="flex items-center justify-center"
                style={{ 
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: countdown <= 10 ? '#C94F3D' : 'rgba(250, 245, 240, 0.2)',
                  color: '#FAF5F0',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  boxShadow: countdown <= 10 
                    ? '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)' 
                    : '0 0 20px rgba(250, 245, 240, 0.3)'
                }}
                animate={countdown <= 10 ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)',
                    '0 0 40px rgba(201, 79, 61, 1), 0 0 80px rgba(201, 79, 61, 0.6)',
                    '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)'
                  ]
                } : {}}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {countdown}
              </motion.div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="px-16 py-12">
        <div className="max-w-[1200px] mx-auto space-y-10">
          {/* Title with Llama */}
          <div className="flex items-center gap-4">
            <div className="space-y-4 flex-1">
              <h1 
                className="tracking-tight"
                style={{ 
                  fontSize: '3.5rem',
                  fontWeight: 700,
                  color: '#FAF5F0',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}
              >
                Record your practice.
              </h1>
              <p 
                style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: '#FAF5F0',
                  opacity: 0.9,
                  maxWidth: '42rem'
                }}
              >
                Tell us about yourself.
              </p>
            </div>
            
            {/* Llama with Camera */}
            <motion.img
              src={llamaCameraImage}
              alt="Llama with camera"
              style={{
                height: '140px',
                width: 'auto'
              }}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, 0, -3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Video Frame */}
          <div className="relative">
            <motion.div 
              className="aspect-video overflow-hidden relative"
              style={{ 
                backgroundColor: 'rgba(58, 46, 40, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 0 40px rgba(250, 245, 240, 0.2), 0 0 80px rgba(255, 122, 37, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.3)'
              }}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(250, 245, 240, 0.2), 0 0 80px rgba(255, 122, 37, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.3)',
                  '0 0 50px rgba(250, 245, 240, 0.3), 0 0 100px rgba(255, 122, 37, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.3)',
                  '0 0 40px rgba(250, 245, 240, 0.2), 0 0 80px rgba(255, 122, 37, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.3)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mock Webcam Feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div 
                    className="mx-auto flex items-center justify-center"
                    style={{ 
                      width: '6rem',
                      height: '6rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(250, 245, 240, 0.1)'
                    }}
                  >
                    <Circle className="text-[#FAF5F0] opacity-40" size={48} />
                  </div>
                  <p style={{ color: '#FAF5F0', opacity: 0.7, fontSize: '1rem', fontWeight: 500 }}>
                    Camera preview
                  </p>
                </div>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <motion.div 
                  className="absolute top-8 left-8 flex items-center gap-3 px-5 py-3"
                  style={{ 
                    backgroundColor: '#C94F3D',
                    color: '#FAF5F0',
                    borderRadius: '30px',
                    boxShadow: '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)'
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)',
                      '0 0 40px rgba(201, 79, 61, 1), 0 0 80px rgba(201, 79, 61, 0.6)',
                      '0 0 30px rgba(201, 79, 61, 0.8), 0 0 60px rgba(201, 79, 61, 0.4)'
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div 
                    className="animate-pulse"
                    style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#FAF5F0', borderRadius: '50%' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Recording</span>
                </motion.div>
              )}
            </motion.div>

            {/* Record Button */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              {!isRecording ? (
                <motion.button
                  onClick={handleStartRecording}
                  className="flex items-center justify-center"
                  style={{ 
                    width: '5rem',
                    height: '5rem',
                    backgroundColor: '#C94F3D',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px rgba(201, 79, 61, 0.7), 0 0 60px rgba(201, 79, 61, 0.4)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 0 40px rgba(201, 79, 61, 0.9), 0 0 80px rgba(201, 79, 61, 0.6)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(201, 79, 61, 0.7), 0 0 60px rgba(201, 79, 61, 0.4)',
                      '0 0 40px rgba(201, 79, 61, 0.8), 0 0 70px rgba(201, 79, 61, 0.5)',
                      '0 0 30px rgba(201, 79, 61, 0.7), 0 0 60px rgba(201, 79, 61, 0.4)'
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <div style={{ width: '2rem', height: '2rem', backgroundColor: '#FAF5F0', borderRadius: '50%' }} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleStopRecording}
                  className="flex items-center justify-center"
                  style={{ 
                    width: '5rem',
                    height: '5rem',
                    backgroundColor: '#C94F3D',
                    borderRadius: '50%',
                    boxShadow: '0 0 40px rgba(201, 79, 61, 0.9), 0 0 80px rgba(201, 79, 61, 0.6)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 0 50px rgba(201, 79, 61, 1), 0 0 100px rgba(201, 79, 61, 0.8)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div style={{ width: '1.5rem', height: '1.5rem', backgroundColor: '#FAF5F0', borderRadius: '4px' }} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <motion.div 
            className="mt-24 p-12"
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
            <h3 
              className="mb-8"
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#FAF5F0',
                letterSpacing: '-0.01em'
              }}
            >
              Things to keep in mind
            </h3>
            <div className="grid grid-cols-2 gap-x-16 gap-y-6">
              <div>
                <div 
                  className="mb-2"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAF5F0' }}
                >
                  Posture
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#FAF5F0', opacity: 0.8 }}>
                  Sit upright with shoulders relaxed
                </p>
              </div>
              <div>
                <div 
                  className="mb-2"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAF5F0' }}
                >
                  Eye contact
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#FAF5F0', opacity: 0.8 }}>
                  Look directly at the camera
                </p>
              </div>
              <div>
                <div 
                  className="mb-2"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAF5F0' }}
                >
                  Pacing
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#FAF5F0', opacity: 0.8 }}>
                  Speak slowly and clearly
                </p>
              </div>
              <div>
                <div 
                  className="mb-2"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAF5F0' }}
                >
                  Authenticity
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 400, color: '#FAF5F0', opacity: 0.8 }}>
                  Be natural and genuine
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}