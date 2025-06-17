import axios, { AxiosError } from 'axios';

// Configure the backend URL
const API_BASE_URL = 'https://medical-diagnosis-smwn.onrender.com';
const WS_BASE_URL = 'wss://medical-diagnosis-smwn.onrender.com';
const MAX_RETRIES = 3;

// Log the API endpoint being used
console.log(`Using API endpoint: ${API_BASE_URL}`);

const API_TIMEOUT = 30000; // 30 seconds timeout for API requests
const WS_TIMEOUT = 30000; // 30 seconds timeout for WebSocket operations

export interface PatientData {
  name: string;
  age: number;
  gender: string;
  symptoms: string[];
}

export interface SessionData {
  name: string;
  age: number;
  gender: string;
  symptoms: string[];
  chat_history: any[];
}

export interface FollowUpOption {
  key: string;
  value: string;
}

export interface FollowUpQuestion {
  question: string;
  options: Array<{ key: string; value: string }>;
  status: 'waiting_for_answer' | 'ready_for_diagnosis';
}

export interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export interface SymptomResponse {
  message: string;
  status: 'symptom_submitted';
  session_id: string;
}

/**
 * Helper function to implement retry logic with exponential backoff
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = 1000,
  backoff = 2
): Promise<T> => {
  try {
    return await requestFn();
  } catch (err) {
    // Don't retry 4xx errors (client errors)
    if (axios.isAxiosError(err) && err.response && err.response.status >= 400 && err.response.status < 500) {
      throw err;
    }
    
    if (retries <= 0) {
      throw err;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * backoff, backoff);
  }
};

/**
 * Format error for consistent handling throughout the app
 */
const formatError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || 'Server error',
        status: axiosError.response.status
      };
    }
    
    if (axiosError.request) {
      return {
        message: 'No response from server. Please check your internet connection.',
        isNetworkError: true
      };
    }
  }
  
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred'
  };
};

// Helper function to get the API base URL
const getBaseUrl = (isHtmlEndpoint: boolean = false) => {
  return isHtmlEndpoint ? API_BASE_URL : API_BASE_URL;
};

// Generic API request function with error handling
const apiRequest = async <T>(
  url: string, 
  method: string = 'GET', 
  data?: any,
  onProgress?: (progress: number) => void,
  isHtmlEndpoint: boolean = false
): Promise<T> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${getBaseUrl(isHtmlEndpoint)}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Server responded with status: ${response.status}`);
    }
    
    // Handle progress for blob responses if needed
    if (onProgress && response.body) {
      const contentLength = Number(response.headers.get('Content-Length')) || 0;
      let loaded = 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (contentLength > 0) {
          onProgress(Math.min(Math.round((loaded / contentLength) * 100), 100));
        }
      }
      
      // Reconstruct the response from chunks
      const blob = new Blob(chunks);
      return blob as unknown as T;
    }
    
    // Regular JSON response
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('application/pdf')) {
      return await response.blob() as unknown as T;
    } else {
      return await response.text() as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

// Submit patient data to start diagnosis
export const submitPatientData = async (data: PatientData): Promise<SymptomResponse> => {
  return apiRequest('/symptom', 'POST', data);
};

// Get session data
export const getSessionData = async (sessionId: string): Promise<SessionData> => {
  return apiRequest(`/session/${sessionId}`, 'GET');
};

// Connect to WebSocket for follow-up questions
export const connectToWebSocket = (
  sessionId: string, 
  onQuestion: (question: string, options: FollowUpOption[], sendAnswer: (answer: string) => void) => void,
  onComplete: (message: string) => void,
  onError: (error: ApiError) => void
) => {
  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnecting = false;
  let isIntentionalClose = false;
  let connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const MAX_RECONNECT_ATTEMPTS = 5;
  const CONNECTION_TIMEOUT = 10000; // 10 seconds
  
  const clearTimeouts = () => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };
  
  const connect = () => {
    try {
      clearTimeouts();
      
      // Convert http/https to ws/wss for WebSocket connection
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsBaseUrl = API_BASE_URL.replace(/^https?:\/\//, `${wsProtocol}://`);
      const wsUrl = `${wsBaseUrl}/followup/${sessionId}`;
      
      console.log('WebSocket connection details:', {
        wsUrl,
        sessionId,
        reconnectAttempts,
        isIntentionalClose
      });
      
      // Close existing socket if any
      if (socket) {
        try {
          socket.close();
        } catch (err) {
          console.warn('Error closing existing socket:', err);
        }
        socket = null;
      }
      
      // Create new socket
      socket = new WebSocket(wsUrl);
      
      // Set connection timeout
      connectionTimeout = setTimeout(() => {
        console.error('WebSocket connection timeout');
        if (socket && socket.readyState !== WebSocket.OPEN) {
          try {
            socket.close();
          } catch (err) {
            console.warn('Error closing socket after timeout:', err);
          }
          
          if (!isIntentionalClose && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnecting = true;
            reconnectAttempts++;
            
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Connection timed out. Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
            
            reconnectTimeout = setTimeout(connect, delay);
          } else {
            onError({ 
              message: 'Connection timed out. Please check your internet connection.',
              isNetworkError: true
            });
          }
        }
      }, CONNECTION_TIMEOUT);
      
      socket.onopen = () => {
        console.log('WebSocket connected successfully');
        clearTimeouts();
        reconnectAttempts = 0;
        reconnecting = false;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.status === 'waiting_for_answer') {
            onQuestion(data.question, data.options, (answer) => {
              if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(answer);
              }
            });
          } else if (data.status === 'ready_for_diagnosis') {
            onComplete(data.message);
            if (socket) {
              try {
                socket.close();
              } catch (err) {
                console.warn('Error closing socket after diagnosis ready:', err);
              }
            }
          } else if (data.error) {
            onError({ message: data.error });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, 'Raw data:', event.data);
          onError({ message: 'Invalid data received from server' });
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        clearTimeouts();
        onError({ 
          message: 'Connection error. Please check your internet connection.',
          isNetworkError: true
        });
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          reconnectAttempts,
          reconnecting,
          isIntentionalClose
        });
        
        clearTimeouts();
        
        if (!event.wasClean && !isIntentionalClose && !reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnecting = true;
          reconnectAttempts++;
          
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
          
          reconnectTimeout = setTimeout(connect, delay);
        } else if (!isIntentionalClose && reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          onError({ 
            message: 'Unable to maintain connection to the server. Please try again later.',
            isNetworkError: true
          });
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      clearTimeouts();
      onError({ message: 'Failed to establish connection' });
    }
  };
  
  // Initial connection
  connect();
  
  return {
    close: () => {
      isIntentionalClose = true;
      clearTimeouts();
      
      if (socket) {
        try {
          socket.close(1000, 'User initiated close');
        } catch (err) {
          console.warn('Error during intentional WebSocket close:', err);
        }
        socket = null;
      }
    }
  };
};

// Generate diagnosis report
export const generateReport = async (sessionId: string): Promise<Blob> => {
  return apiRequest(`/generate_report/${sessionId}`, 'GET');
};

// Ask a medical question
export const askMedicalQuestion = async (question: string): Promise<{ answer: string; explanation?: string }> => {
  return apiRequest('/ask', 'POST', { question });
};

export const api = {
  // Submit initial symptoms
  submitSymptoms: async (data: PatientData): Promise<{ session_id: string }> => {
    const response = await axios.post(`${API_BASE_URL}/symptom`, data);
    return response.data;
  },

  // Get session data
  getSessionData: async (sessionId: string): Promise<SessionData> => {
    const response = await axios.get(`${API_BASE_URL}/session/${sessionId}`);
    return response.data;
  },

  // Generate report
  generateReport: async (sessionId: string): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/generate_report/${sessionId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Create WebSocket connection for follow-up questions
  createFollowUpWebSocket: (sessionId: string): WebSocket => {
    const wsUrl = `${WS_BASE_URL}/followup/${sessionId}`;
    console.log('Connecting to WebSocket:', wsUrl);
    return new WebSocket(wsUrl);
  },

  // Save diagnosis report
  saveDiagnosisReport: async (reportData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/save_report`, reportData);
    return response.data;
  },

  // Get diagnosis report
  getDiagnosisReport: async (sessionId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/get_report/${sessionId}`);
    return response.data;
  }
}; 