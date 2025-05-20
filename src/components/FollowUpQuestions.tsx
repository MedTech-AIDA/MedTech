import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FollowUpQuestionsProps {
  sessionId: string;
  onComplete: () => void;
  onError: (error: any) => void;
  onConnectionStatus: (status: boolean) => void;
}

interface Message {
  type: 'bot' | 'user';
  content: string;
  options?: Array<{ key: string; value: string }>;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  sessionId,
  onComplete,
  onError,
  onConnectionStatus
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [loadingMessage, setLoadingMessage] = useState('Connecting to server...');

  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const MESSAGE_TIMEOUT = 30000;
  const HEARTBEAT_INTERVAL = 15000;
  const LOADING_MESSAGES = [
    'Analyzing your symptoms...',
    'Processing medical data...',
    'Consulting medical knowledge base...',
    'Preparing follow-up questions...'
  ];

  const scrollToBottom = useCallback(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, []);

  const updateLoadingMessage = useCallback(() => {
    if (!mountedRef.current) return;
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setLoadingMessage(LOADING_MESSAGES[randomIndex]);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleQuestion = useCallback((data: any) => {
    if (!mountedRef.current) return;
    
    setLastMessageTime(Date.now());
    if (data.question) {
      addMessage({ 
        type: 'bot', 
        content: data.question,
        options: data.options 
      });
      setIsLoading(false);
      setError(null);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    } else if (data.message) {
      addMessage({ type: 'bot', content: data.message });
      if (data.status === 'ready_for_diagnosis') {
        setIsComplete(true);
        setIsLoading(false);
        onComplete();
      }
    } else if (data.error) {
      addMessage({ type: 'bot', content: `Error: ${data.error}` });
      handleError(new Error(data.error));
    }
  }, [onComplete, addMessage]);

  const handleError = useCallback((error: any) => {
    if (!mountedRef.current) return;
    
    console.error('WebSocket error:', error);
    setError(error.message || 'An error occurred while processing your answer');
    setIsLoading(false);
    onError(error);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, [onError]);

  const connectWebSocket = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      setConnectionStatus('connecting');
      // Convert http/https to ws/wss for WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/diagnosis/${sessionId}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnectionStatus(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        setError(null);
        
        // Start rotating loading messages
        loadingTimeoutRef.current = setInterval(updateLoadingMessage, 3000);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          handleQuestion(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          handleError(error);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        onConnectionStatus(false);
        setConnectionStatus('disconnected');
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setReconnectAttempts(prev => prev + 1);
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectWebSocket();
            }
          }, delay);
        } else {
          handleError(new Error('Connection lost. Please try again.'));
        }
      };

      ws.onerror = (event: Event) => {
        if (!mountedRef.current) return;
        console.error('WebSocket error:', event);
        handleError(new Error('WebSocket connection error'));
      };

      // Set up heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, HEARTBEAT_INTERVAL);

      // Set up message timeout
      messageTimeoutRef.current = setTimeout(() => {
        if (Date.now() - lastMessageTime > MESSAGE_TIMEOUT) {
          ws.close();
        }
      }, MESSAGE_TIMEOUT);

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      handleError(error);
    }
  }, [sessionId, handleQuestion, handleError, reconnectAttempts, lastMessageTime, updateLoadingMessage, onConnectionStatus]);

  useEffect(() => {
    mountedRef.current = true;
    connectWebSocket();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setIsSubmitting(true);
    try {
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        answer: answer.trim()
      }));
      addMessage({ type: 'user', content: answer.trim() });
      setAnswer('');
      setIsLoading(true);
      setLoadingMessage('Processing your answer...');
    } catch (error) {
      console.error('Error sending answer:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {connectionStatus === 'connecting' && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{loadingMessage}</p>
        </div>
      )}

      {connectionStatus === 'disconnected' && (
        <div className="text-center py-4">
          <p className="text-red-600">Connection lost. Attempting to reconnect...</p>
          <p className="text-sm text-gray-600">Attempt {reconnectAttempts + 1} of {MAX_RECONNECT_ATTEMPTS}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry Now
          </button>
        </div>
      )}

      <div 
        ref={chatBoxRef}
        className="border border-gray-300 rounded-md p-4 mb-4 h-[400px] overflow-y-auto bg-white"
      >
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-2 ${
              message.type === 'bot' ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            <strong>{message.type === 'bot' ? 'Bot:' : 'You:'}</strong>{' '}
            {message.content}
            {message.options && (
              <div className="ml-4 mt-1">
                {message.options.map((option, optIndex) => (
                  <div key={optIndex} className="text-gray-600">
                    {option.key}: {option.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isConnected && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!answer.trim() || isSubmitting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !answer.trim() || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FollowUpQuestions;