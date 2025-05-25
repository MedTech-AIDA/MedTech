import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getSessionId } from '../utils/sessionStorage';

interface Message {
  type: 'bot' | 'user';
  content: string;
  options?: Array<{ key: string; value: string }>;
}

interface DiagnosisTestProps {
  onComplete: () => void;
  onError?: (error: any) => void;
  onConnectionStatus?: (status: boolean) => void;
}

const WS_BASE_URL = 'wss://medical-diagnosis-smwn.onrender.com';

const DiagnosisTest: React.FC<DiagnosisTestProps> = ({ 
  onComplete, 
  onError,
  onConnectionStatus 
}) => {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const startChat = useCallback(() => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setError(null);
    setMessages([]);
    addMessage({ type: 'bot', content: 'Connecting...' });

    try {
      const wsUrl = `${WS_BASE_URL}/followup/${sessionId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        onConnectionStatus?.(true);
        addMessage({ type: 'bot', content: '🟢 Connected' });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.question) {
            addMessage({ 
              type: 'bot', 
              content: data.question,
              options: data.options 
            });
          } else if (data.message) {
            addMessage({ type: 'bot', content: data.message });
            if (data.message.includes('diagnosis complete') || 
                data.message.includes('Thank you for your answers') ||
                data.status === 'ready_for_diagnosis') {
              // Close the WebSocket connection gracefully
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
              }
              // Call onComplete to trigger navigation
              onComplete();
            }
          } else if (data.error) {
            addMessage({ type: 'bot', content: `Error: ${data.error}` });
            onError?.(new Error(data.error));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          addMessage({ type: 'bot', content: 'Error parsing message from server' });
          onError?.(error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onConnectionStatus?.(false);
        addMessage({ type: 'bot', content: '🔴 Connection closed' });
        // If we're already complete, don't show an error
        if (!messages.some(m => m.content.includes('diagnosis complete'))) {
          setError('Connection closed unexpectedly');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage({ type: 'bot', content: '❌ Connection error' });
        setError('Connection error occurred');
        onError?.(error);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to create WebSocket connection');
      addMessage({ type: 'bot', content: '❌ Failed to connect' });
      onError?.(error);
    }
  }, [sessionId, addMessage, onComplete, onError, onConnectionStatus]);

  // Load session ID and start chat automatically
  useEffect(() => {
    const storedSessionId = getSessionId();
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Start chat automatically after a short delay to ensure state is updated
      setTimeout(() => {
        startChat();
      }, 100);
    }
  }, [startChat]);

  const sendAnswer = useCallback(() => {
    if (!userAnswer.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current.send(userAnswer);
      addMessage({ type: 'user', content: userAnswer });
      setUserAnswer('');
    } catch (error) {
      console.error('Error sending answer:', error);
      addMessage({ type: 'bot', content: '⚠️ Failed to send answer' });
      onError?.(error);
    }
  }, [userAnswer, addMessage, onError]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Diagnosis Chat</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
          {error}
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
        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={sendAnswer}
            disabled={!userAnswer.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !userAnswer.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default DiagnosisTest; 