import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic, Square, Volume2, Loader2 } from "lucide-react";
import {
  transcribeAudio,
  sendConversationMessage,
  generateVoiceFeedback,
  ConversationMessage,
  AnalysisResponse,
  APIError
} from "../../../services/api";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisContext?: AnalysisResponse;
}

type MessageStatus = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';

export function ConversationModal({ isOpen, onClose, analysisContext }: ConversationModalProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<MessageStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Greet user when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && isFirstMessage) {
      setIsFirstMessage(false);
      const greeting: ConversationMessage = {
        role: 'assistant',
        content: "Hi! I just reviewed your practice session. How can I help you improve? Feel free to ask me anything!",
        timestamp: Date.now()
      };
      setMessages([greeting]);
      speakMessage(greeting.content);
    }
  }, [isOpen, messages.length, isFirstMessage]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;
      return stream;
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      return null;
    }
  };

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];

    const stream = streamRef.current || await requestMicrophonePermission();
    if (!stream) return;

    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processUserMessage(audioBlob);
      };

      mediaRecorder.start(100);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const processUserMessage = async (audioBlob: Blob) => {
    try {
      // Transcribe user's speech
      setStatus('transcribing');
      const transcribeResponse = await transcribeAudio(audioBlob);
      const userMessage = transcribeResponse.transcript;

      // Add user message to chat
      const userMsg: ConversationMessage = {
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);

      // Get AI response
      setStatus('thinking');
      const conversationResponse = await sendConversationMessage({
        message: userMessage,
        conversationHistory: messages,
        analysisContext: analysisContext
      });

      // Add AI response to chat
      const aiMsg: ConversationMessage = {
        role: 'assistant',
        content: conversationResponse.response,
        timestamp: Date.now()
      };
      setMessages(conversationResponse.conversationHistory);

      // Speak AI response
      await speakMessage(conversationResponse.response);

      setStatus('idle');
    } catch (err) {
      console.error('Conversation error:', err);
      if (err instanceof APIError) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to process message. Please try again.');
      }
      setStatus('idle');
    }
  };

  const speakMessage = async (text: string) => {
    try {
      console.log('🎤 Starting voice generation for:', text.substring(0, 50) + '...');
      setStatus('speaking');
      const voiceResponse = await generateVoiceFeedback(text);
      console.log('✅ Voice response received:', voiceResponse);

      // Create audio element and play
      // Backend returns { audio: base64string }
      const audioData = (voiceResponse as any).audio || voiceResponse.audioData || voiceResponse.audioUrl;

      if (!audioData) {
        console.error('❌ No audio data in response:', voiceResponse);
        setError('Voice generation failed: No audio data received');
        setStatus('idle');
        return;
      }

      console.log('🔊 Converting audio data to blob (length:', audioData.length, ')');

      // Convert base64 to blob for better browser compatibility
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🎵 Blob URL created:', audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log('✅ Audio playback completed');
        setStatus('idle');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e, audio.error);
        setError('Voice playback failed. Check console for details.');
        setStatus('idle');
        URL.revokeObjectURL(audioUrl);
      };

      console.log('▶️ Starting audio playback...');
      await audio.play();
      console.log('✅ Audio playing');
    } catch (err: any) {
      console.error('❌ Voice generation/playback failed:', err);
      setError(`Voice error: ${err.message || 'Unknown error'}`);
      setStatus('idle');
    }
  };

  const handleRecordClick = () => {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle') {
      startRecording();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
        style={{
          background: 'linear-gradient(180deg, #F19D4F 0%, #FF7A25 100%)',
          borderRadius: '24px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Fredoka, sans-serif',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(250, 245, 240, 0.2)' }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#FAF5F0',
                marginBottom: '0.25rem'
              }}
            >
              Talk to Your AI Coach
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#FAF5F0', opacity: 0.8 }}>
              {status === 'recording' && 'Listening...'}
              {status === 'transcribing' && 'Understanding...'}
              {status === 'thinking' && 'Thinking...'}
              {status === 'speaking' && 'Speaking...'}
              {status === 'idle' && 'Press mic to speak'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="transition-opacity hover:opacity-70"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(250, 245, 240, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAF5F0'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ minHeight: '300px', maxHeight: '400px' }}
        >
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] p-4"
                  style={{
                    backgroundColor: msg.role === 'user'
                      ? 'rgba(250, 245, 240, 0.95)'
                      : 'rgba(58, 46, 40, 0.4)',
                    color: msg.role === 'user' ? '#3A2E28' : '#FAF5F0',
                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    fontSize: '1rem',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none'
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mx-6 mb-4 p-3"
            style={{
              backgroundColor: '#C94F3D',
              color: '#FAF5F0',
              borderRadius: '12px',
              fontSize: '0.875rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="p-6 text-center">
          <motion.button
            onClick={handleRecordClick}
            disabled={status !== 'idle' && status !== 'recording'}
            className="mx-auto flex items-center justify-center"
            style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: status === 'recording' ? '#C94F3D' : '#FAF5F0',
              color: status === 'recording' ? '#FAF5F0' : '#FF7A25',
              borderRadius: '50%',
              boxShadow: status === 'recording'
                ? '0 0 40px rgba(201, 79, 61, 0.9), 0 0 80px rgba(201, 79, 61, 0.6)'
                : '0 0 30px rgba(250, 245, 240, 0.6)',
              opacity: status !== 'idle' && status !== 'recording' ? 0.5 : 1
            }}
            whileHover={status === 'idle' || status === 'recording' ? { scale: 1.1 } : {}}
            whileTap={status === 'idle' || status === 'recording' ? { scale: 0.95 } : {}}
            animate={
              status === 'recording'
                ? {
                    boxShadow: [
                      '0 0 40px rgba(201, 79, 61, 0.9), 0 0 80px rgba(201, 79, 61, 0.6)',
                      '0 0 50px rgba(201, 79, 61, 1), 0 0 100px rgba(201, 79, 61, 0.8)',
                      '0 0 40px rgba(201, 79, 61, 0.9), 0 0 80px rgba(201, 79, 61, 0.6)'
                    ]
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: status === 'recording' ? Infinity : 0,
              ease: 'easeInOut'
            }}
          >
            {status === 'idle' && <Mic size={28} />}
            {status === 'recording' && <Square size={28} />}
            {(status === 'transcribing' || status === 'thinking') && (
              <Loader2 size={28} className="animate-spin" />
            )}
            {status === 'speaking' && <Volume2 size={28} className="animate-pulse" />}
          </motion.button>
          <p
            className="mt-4"
            style={{
              fontSize: '0.875rem',
              color: '#FAF5F0',
              opacity: 0.8
            }}
          >
            {status === 'idle' && 'Hold to talk or tap to record'}
            {status === 'recording' && 'Release when done speaking'}
            {status === 'transcribing' && 'Converting speech to text...'}
            {status === 'thinking' && 'AI is thinking...'}
            {status === 'speaking' && 'AI is speaking...'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
