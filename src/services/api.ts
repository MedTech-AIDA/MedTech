import axios, { AxiosError } from 'axios';

// Configure the backend URL
// This allows easy switching between environments
const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
const MAX_RETRIES = 3;

// Log the API endpoint being used
console.log('API Configuration:', {
  BASE_URL,
  ENV_URL: import.meta.env.VITE_REACT_APP_API_URL,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
});

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
    console.log('Submitting patient data:', {
      url: `${BASE_URL}/symptom`,
      data: patientData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await retryRequest(() => 
      axios.post(`${BASE_URL}/symptom`, patientData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })
    );
    
    console.log('Patient data submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting patient data:', {
      error,
      isAxiosError: axios.isAxiosError(error),
      status: axios.isAxiosError(error) ? error.response?.status : null,
      data: axios.isAxiosError(error) ? error.response?.data : null
    });
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
      const wsUrl = `${BASE_URL.replace('http', 'ws')}/followup/${sessionId}`;
      
      console.log('WebSocket connection details:', {
        wsUrl,
        sessionId,
        reconnectAttempts,
        isIntentionalClose,
        readyState: socket ? socket.readyState : 'N/A'
      });
      
      // Close existing socket if any
      if (socket) {
        try {
          socket.close();
        } catch (err) {
          console.warn('Error closing existing socket:', err);
        }
      }
      
      // Create new socket with error handling
      try {
        socket = new WebSocket(wsUrl);
        
        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          console.error('WebSocket connection timeout', {
            wsUrl,
            readyState: socket?.readyState,
            reconnectAttempts
          });
          
          if (socket && socket.readyState !== WebSocket.OPEN) {
            socket.close();
            
            // Attempt reconnection if not intentionally closed
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
              onClose();
            }
          }
        }, CONNECTION_TIMEOUT);
        
        socket.onopen = () => {
          console.log('WebSocket connected successfully', {
            wsUrl,
            readyState: socket?.readyState
          });
          clearTimeouts();
          reconnectAttempts = 0;
          reconnecting = false;
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', {
              data,
              readyState: socket?.readyState
            });
            onMessage(data);
          } catch (err) {
            console.error('Error parsing WebSocket message:', {
              error: err,
              rawData: event.data,
              readyState: socket?.readyState
            });
            onError({ message: 'Invalid data received from server' });
          }
        };
        
        socket.onerror = (event) => {
          console.error('WebSocket error:', {
            event,
            readyState: socket?.readyState,
            wsUrl
          });
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
            isIntentionalClose,
            readyState: socket?.readyState,
            wsUrl
          });
          
          clearTimeouts();
          
          // Attempt to reconnect unless this was an intentional close
          if (!event.wasClean && !isIntentionalClose && !reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnecting = true;
            reconnectAttempts++;
            
            // Exponential backoff for reconnection
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts})`);
            
            reconnectTimeout = setTimeout(connect, delay);
          } else if (!isIntentionalClose && reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            onError({ 
              message: 'Unable to maintain connection to the server. Please try again later.',
              isNetworkError: true
            });
            onClose();
          } else if (isIntentionalClose || event.wasClean) {
            onClose();
          }
        };
      } catch (err) {
        console.error('Error creating WebSocket:', {
          error: err,
          wsUrl,
          readyState: socket?.readyState
        });
        clearTimeouts();
        onError({ message: 'Failed to establish connection' });
        onClose();
      }
    } catch (err) {
      console.error('Error in connect function:', {
        error: err,
        wsUrl: `${BASE_URL.replace('http', 'ws')}/followup/${sessionId}`,
        readyState: socket?.readyState
      });
      clearTimeouts();
      onError({ message: 'Failed to establish connection' });
      onClose();
    }
  };
  
  // Initial connection
  connect();
  
  return {
    sendAnswer: (answer: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify({ answer }));
        } catch (err) {
          console.error('Error sending answer:', err);
          onError({ message: 'Failed to send answer. Please try again.' });
        }
      } else {
        console.warn('Cannot send answer: WebSocket not open', {
          socketExists: !!socket,
          readyState: socket ? socket.readyState : 'N/A'
        });
        
        // Try to reconnect if socket is not open
        if (socket && socket.readyState === WebSocket.CLOSED && !reconnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log('Connection lost. Attempting to reconnect...');
          onError({ message: 'Connection lost. Trying to reconnect...' });
          connect();
        } else {
          onError({ message: 'Connection lost. Please refresh the page and try again.' });
        }
      }
    },
    close: () => {
      isIntentionalClose = true;
      clearTimeouts();
      
      if (socket) {
        try {
          // Use a cleaner close code
          socket.close(1000, 'User initiated close');
        } catch (err) {
          console.warn('Error during intentional WebSocket close:', err);
        }
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