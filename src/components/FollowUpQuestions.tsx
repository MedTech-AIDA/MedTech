import React, { useEffect, useState, useRef } from 'react';
import { connectToWebSocket } from '../services/api';
import type { FollowUpQuestion, FollowUpOption } from '../services/api';

interface FollowUpQuestionsProps {
  sessionId: string;
  onComplete: () => void;
  onError: (error: any) => void;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ 
  sessionId, 
  onComplete, 
  onError 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<FollowUpQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [questionHistory, setQuestionHistory] = useState<Array<{
    question: string;
    selectedAnswer?: string;
    timestamp: Date;
  }>>([]);
  
  const webSocketRef = useRef<ReturnType<typeof connectToWebSocket> | null>(null);
  const mountedRef = useRef(false);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(`Initializing WebSocket connection for session: ${sessionId}`);
    mountedRef.current = true;
    
    // Establish WebSocket connection
    const webSocketConnection = connectToWebSocket(
      sessionId,
      // onMessage handler
      (data) => {
        if (!mountedRef.current) return;
        
        console.log('Received question data:', data);
        if (data.status === 'completed') {
          onComplete();
        } else {
          setCurrentQuestion(data);
          setIsConnecting(false);
          setLoading(false);
        }
      },
      // onError handler
      (err) => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket error in component:', err);
        setError(err.message || 'Connection error');
        onError(err);
      },
      // onClose handler
      () => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket connection closed in component');
        // Only show the error if we're still loading (connection never established)
        if (loading) {
          setError('Connection to server lost. Please try again.');
          onError(new Error('WebSocket connection closed'));
        }
      }
    );
    
    // Store the connection
    webSocketRef.current = webSocketConnection;
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connection');
      mountedRef.current = false;
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [sessionId, onComplete, onError]);

  // Scroll to the bottom when a new question is added or answered
  useEffect(() => {
    if (questionsContainerRef.current) {
      questionsContainerRef.current.scrollTop = questionsContainerRef.current.scrollHeight;
    }
  }, [questionHistory, currentQuestion]);

  const handleSelectOption = (key: string) => {
    setSelectedOption(key);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion || !webSocketRef.current) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the selected option text to display in history
      const selectedText = currentQuestion.options.find(
        (opt) => opt.key === selectedOption
      )?.value || '';

      // Add to question history
      setQuestionHistory((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          selectedAnswer: `${selectedText}`,
          timestamp: new Date()
        }
      ]);

      // Send answer via WebSocket
      console.log('Sending answer:', selectedOption);
      webSocketRef.current.sendAnswer(selectedOption);
      
      // Reset selection for next question
      setSelectedOption(null);
      setCurrentQuestion(null); // Clear current question while waiting for next one
      setIsConnecting(true); // Show loading state while waiting for next question
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-red-600 text-2xl">error_outline</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center"
            onClick={() => window.location.reload()}
          >
            <span className="material-icons mr-2">refresh</span>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 p-6">
        <h2 className="text-2xl font-bold text-white">Follow-up Questions</h2>
        <p className="text-blue-100 mt-1">Please answer these questions to help us provide a more accurate diagnosis</p>
      </div>
      
      {/* Conversation history */}
      <div 
        ref={questionsContainerRef} 
        className="flex-1 p-6 overflow-y-auto max-h-[400px] space-y-4"
      >
        {questionHistory.map((item, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-blue-600">medical_services</span>
              </div>
              <div className="ml-3 bg-blue-50 py-3 px-4 rounded-lg rounded-tl-none max-w-[80%]">
                <p className="text-gray-900">{item.question}</p>
                <span className="text-xs text-gray-500 block mt-1">{formatTime(item.timestamp)}</span>
              </div>
            </div>
            
            {item.selectedAnswer && (
              <div className="flex items-start justify-end">
                <div className="mr-3 bg-gray-100 py-3 px-4 rounded-lg rounded-tr-none max-w-[80%]">
                  <p className="text-gray-900">{item.selectedAnswer}</p>
                  <span className="text-xs text-gray-500 block mt-1">{formatTime(item.timestamp)}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-gray-600">person</span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Current question or loading state */}
        {isConnecting ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-icons text-blue-500 text-sm">medical_services</span>
                </div>
              </div>
              <p className="mt-4 text-gray-700">
                {currentQuestion ? 'Processing your answer...' : 'Analyzing your information...'}
              </p>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="animate-fadeIn">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-blue-600">medical_services</span>
              </div>
              <div className="ml-3 bg-blue-50 py-3 px-4 rounded-lg rounded-tl-none max-w-[80%]">
                <p className="text-gray-900">{currentQuestion.question}</p>
                <span className="text-xs text-gray-500 block mt-1">{formatTime(new Date())}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Answer options */}
      {currentQuestion && !isConnecting && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Select an answer:</p>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSelectOption(option.key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedOption === option.key
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 flex-shrink-0 rounded-full mr-3 border-2 flex items-center justify-center ${
                      selectedOption === option.key ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                    }`}>
                      {selectedOption === option.key && (
                        <span className="material-icons text-white text-sm">check</span>
                      )}
                    </div>
                    <span>{option.value}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow transition-all ${
              !selectedOption || isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="material-icons mr-2">send</span>
                Submit Answer
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowUpQuestions;