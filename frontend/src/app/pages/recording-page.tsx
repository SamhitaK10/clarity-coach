import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Circle } from "lucide-react";
// Figma assets removed - not available in repository
// import llamaCameraImage from "figma:asset/095527c69f28e54d29724a279622c46c51a349da.png";
const llamaCameraImage = "";
import { motion } from "motion/react";

export function RecordingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [hasStarted, setHasStarted] = useState(false);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize webcam on component mount
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Unable to access camera. Please grant camera permissions.");
      }
    };

    initWebcam();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (isRecording && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isRecording && countdown === 0) {
      handleStopRecording();
    }
  }, [isRecording, countdown]);

  const handleStartRecording = () => {
    if (!stream) {
      setError("Camera not ready. Please refresh and try again.");
      return;
    }

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadVideo(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setHasStarted(true);
      setCountdown(45);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording. Please try again.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideo = async (videoBlob: Blob) => {
    try {
      navigate('/processing', { state: { videoBlob, language } });
    } catch (err) {
      console.error("Error uploading video:", err);
      setError("Failed to upload video. Please try again.");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP4, MOV, or WEBM video.');
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setUploadedFile(file);
    setError(null);

    // Show preview - must clear srcObject first for file URLs to work
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear webcam stream
      const videoUrl = URL.createObjectURL(file);
      videoRef.current.src = videoUrl;
      videoRef.current.load();

      // Clean up object URL when video loads to prevent memory leaks
      videoRef.current.onloadedmetadata = () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  };

  const handleUploadAnalyze = () => {
    if (!uploadedFile) {
      setError('Please select a video file first.');
      return;
    }

    // Convert File to Blob and navigate
    navigate('/processing', { state: { videoBlob: uploadedFile, language } });
  };

  const handleModeChange = (newMode: "record" | "upload") => {
    setMode(newMode);
    setError(null);
    setUploadedFile(null);
    setHasStarted(false);
    setIsRecording(false);

    // Reset video source
    if (videoRef.current) {
      if (newMode === "record" && stream) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
        videoRef.current.src = "";
      }
    }
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

              {/* Mode Toggle */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleModeChange("record")}
                  disabled={isRecording}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: mode === "record" ? '#FAF5F0' : 'rgba(250, 245, 240, 0.2)',
                    color: mode === "record" ? '#3A2E28' : '#FAF5F0',
                    border: '2px solid rgba(250, 245, 240, 0.3)',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    opacity: isRecording ? 0.5 : 1
                  }}
                >
                  📹 Record Video
                </button>
                <button
                  onClick={() => handleModeChange("upload")}
                  disabled={isRecording}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: mode === "upload" ? '#FAF5F0' : 'rgba(250, 245, 240, 0.2)',
                    color: mode === "upload" ? '#3A2E28' : '#FAF5F0',
                    border: '2px solid rgba(250, 245, 240, 0.3)',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    opacity: isRecording ? 0.5 : 1
                  }}
                >
                  📤 Upload Video
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-4 mt-4">
                <label
                  htmlFor="language"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#FAF5F0',
                    opacity: 0.9
                  }}
                >
                  Speech Language:
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "es")}
                  disabled={isRecording}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: 'rgba(250, 245, 240, 0.2)',
                    color: '#FAF5F0',
                    border: '2px solid rgba(250, 245, 240, 0.3)',
                    fontSize: '1rem',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    opacity: isRecording ? 0.5 : 1
                  }}
                >
                  <option value="en" style={{ backgroundColor: '#F19D4F', color: '#3A2E28' }}>English</option>
                  <option value="es" style={{ backgroundColor: '#F19D4F', color: '#3A2E28' }}>Español (Spanish)</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(201, 79, 61, 0.2)',
                    border: '2px solid rgba(201, 79, 61, 0.5)',
                    color: '#FAF5F0'
                  }}
                >
                  {error}
                </div>
              )}
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
              {/* Upload Mode */}
              {mode === "upload" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  {uploadedFile ? (
                    // Show video preview
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Show upload area
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-center space-y-6 w-full h-full flex flex-col items-center justify-center hover:bg-opacity-60 transition-all"
                      style={{ backgroundColor: 'rgba(58, 46, 40, 0.4)' }}
                    >
                      <div
                        className="mx-auto flex items-center justify-center"
                        style={{
                          width: '8rem',
                          height: '8rem',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(250, 245, 240, 0.15)'
                        }}
                      >
                        <span style={{ fontSize: '4rem' }}>📤</span>
                      </div>
                      <div>
                        <p style={{ color: '#FAF5F0', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          Click to upload video
                        </p>
                        <p style={{ color: '#FAF5F0', opacity: 0.7, fontSize: '1rem' }}>
                          MP4, MOV, WEBM (max 50MB, 90s)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/mov,video/webm,video/quicktime"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Record Mode - Show webcam
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{
                      transform: 'scaleX(-1)' // Mirror the video
                    }}
                  />

                  {/* Fallback when no stream */}
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
                          Initializing camera...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

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

            {/* Action Button */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              {mode === "upload" ? (
                // Analyze Button for Upload Mode
                <motion.button
                  onClick={handleUploadAnalyze}
                  disabled={!uploadedFile}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                  style={{
                    backgroundColor: uploadedFile ? '#FAF5F0' : 'rgba(250, 245, 240, 0.3)',
                    color: uploadedFile ? '#3A2E28' : '#FAF5F0',
                    boxShadow: uploadedFile ? '0 4px 20px rgba(250, 245, 240, 0.4)' : 'none',
                    cursor: uploadedFile ? 'pointer' : 'not-allowed',
                    opacity: uploadedFile ? 1 : 0.6
                  }}
                  whileHover={uploadedFile ? { scale: 1.05 } : {}}
                  whileTap={uploadedFile ? { scale: 0.95 } : {}}
                >
                  🎯 Analyze Video
                </motion.button>
              ) : (
                // Record/Stop Button for Record Mode
                <>
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
                </>
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