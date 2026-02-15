const API_BASE_URL = 'http://localhost:3000';

export interface TranscribeResponse {
  transcript: string;
  duration?: number;
}

export interface AnalysisResponse {
  overallScore: number;
  summary: string;
  categoryScores: CategoryScore[];
  transcript: TranscriptSegment[];
  strongMoments: Moment[];
  areasToImprove: Moment[];
}

export interface CategoryScore {
  id: number;
  category: string;
  score: number;
  insight: string;
  details: string[];
}

export interface TranscriptSegment {
  type: 'normal' | 'filler';
  text: string;
}

export interface Moment {
  timestamp: string;
  timeInSeconds: number;
  description: string;
}

export interface VoiceFeedbackResponse {
  audioUrl: string;
  audioData?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ConversationRequest {
  message: string;
  conversationHistory?: ConversationMessage[];
  analysisContext?: Partial<AnalysisResponse>;
}

export interface ConversationResponse {
  response: string;
  conversationHistory: ConversationMessage[];
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Transcribe audio file using OpenAI Whisper
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscribeResponse> {
  console.log('📤 Preparing to transcribe audio blob:', audioBlob.size, 'bytes', 'type:', audioBlob.type);

  // Determine file extension from blob type
  let extension = '.webm';
  if (audioBlob.type.includes('mp4')) {
    extension = '.mp4';
  } else if (audioBlob.type.includes('mpeg')) {
    extension = '.mp3';
  } else if (audioBlob.type.includes('wav')) {
    extension = '.wav';
  } else if (audioBlob.type.includes('ogg')) {
    extension = '.ogg';
  }

  const filename = `recording${extension}`;
  console.log('📝 Sending as filename:', filename);

  const formData = new FormData();
  formData.append('audio', audioBlob, filename);

  try {
    console.log('🚀 Sending transcription request to:', `${API_BASE_URL}/api/transcribe`);

    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorText = await response.text();
      console.error('❌ Transcription request failed:', response.status, errorText);

      // Try to parse as JSON for better error message
      try {
        const errorJson = JSON.parse(errorText);
        errorText = errorJson.error || errorText;
      } catch {
        // Not JSON, use text as-is
      }

      throw new APIError(
        `Transcription failed: ${errorText}`,
        response.status,
        '/api/transcribe'
      );
    }

    const data = await response.json();
    console.log('✅ Transcription successful:', data.transcript?.substring(0, 100) + '...');
    return data;
  } catch (error) {
    console.error('❌ Transcription error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      '/api/transcribe'
    );
  }
}

/**
 * Analyze transcript using Anthropic Claude
 */
export async function analyzeTranscript(transcript: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Analysis failed: ${errorText}`,
        response.status,
        '/api/analyze'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Failed to analyze transcript: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      '/api/analyze'
    );
  }
}

/**
 * Generate voice feedback using ElevenLabs
 */
export async function generateVoiceFeedback(text: string): Promise<VoiceFeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Voice feedback generation failed: ${errorText}`,
        response.status,
        '/api/voice-feedback'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Failed to generate voice feedback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      '/api/voice-feedback'
    );
  }
}

/**
 * Check if backend is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Send a message in conversation and get AI response
 */
export async function sendConversationMessage(
  request: ConversationRequest
): Promise<ConversationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Conversation failed: ${errorText}`,
        response.status,
        '/api/conversation'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      '/api/conversation'
    );
  }
}
