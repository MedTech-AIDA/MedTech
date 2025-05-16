import axios, { AxiosError } from 'axios';

// Configure the backend URL
// This allows easy switching between environments
const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
const MAX_RETRIES = 3;

// Log the API endpoint being used
console.log(`Using API endpoint: ${BASE_URL}`);

export interface PatientData {
  name: string;
  age: number;
  gender: string;
  symptoms: string;
}

export interface FollowUpOption {
  key: string;
  value: string;
}

export interface FollowUpQuestion {
  question: string;
  options: FollowUpOption[];
  status: 'waiting_for_answer' | 'processing' | 'completed';
}

export interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
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

// Submit initial patient data
export const submitPatientData = async (patientData: PatientData): Promise<{ session_id: string }> => {
  try {
    const response = await retryRequest(() => 
      axios.post(`${BASE_URL}/symptom`, patientData)
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting patient data:', error);
    throw formatError(error);
  }
};

// Connect to WebSocket for follow-up questions with reconnection logic
export const connectToWebSocket = (
  sessionId: string, 
  onMessage: (data: FollowUpQuestion) => void, 
  onError: (error: ApiError) => void,
  onClose: () => void
) => {
  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnecting = false;
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  const connect = () => {
    try {
      // Convert http/https to ws/wss for WebSocket connection
      const protocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = BASE_URL.replace(/^https?:\/\//, '');
      const wsUrl = `${protocol}://${baseUrl}/followup/${sessionId}`;
      
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        reconnecting = false;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as FollowUpQuestion;
          onMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          onError({ message: 'Invalid data received from server' });
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        onError({ 
          message: 'Connection error. Please check your internet connection.',
          isNetworkError: true
        });
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt to reconnect unless this was an intentional close
        if (!event.wasClean && !reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnecting = true;
          reconnectAttempts++;
          
          // Exponential backoff for reconnection
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
          
          setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          onError({ 
            message: 'Unable to maintain connection to the server. Please try again later.',
            isNetworkError: true
          });
          onClose();
        } else if (event.wasClean) {
          onClose();
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      onError({ message: 'Failed to establish connection' });
    }
  };
  
  // Initial connection
  connect();
  
  return {
    sendAnswer: (answer: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ answer }));
      } else {
        console.warn('Cannot send answer: WebSocket not open');
        onError({ message: 'Connection lost. Trying to reconnect...' });
      }
    },
    close: () => {
      if (socket) {
        // Prevent reconnection attempts when intentionally closing
        reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
        socket.close();
        socket = null;
      }
    }
  };
};

// Get diagnosis report with download progress
export const generateReport = async (
  sessionId: string, 
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    const response = await axios.get(`${BASE_URL}/generate_report/${sessionId}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentComplete);
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw formatError(error);
  }
}; 