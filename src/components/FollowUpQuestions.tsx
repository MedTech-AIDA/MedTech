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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<Array<{
    question: string;
    selectedAnswer?: string;
  }>>([]);
  
  const webSocketRef = useRef<ReturnType<typeof connectToWebSocket> | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    try {
      webSocketRef.current = connectToWebSocket(
        sessionId,
        (data) => {
          setCurrentQuestion(data);
          
          if (data.status === 'completed') {
            onComplete();
          }
        },
        (error) => {
          setError('Connection error. Please try again.');
          onError(error);
        },
        () => {
          // Handle WebSocket close
          console.log('WebSocket connection closed');
        }
      );
    } catch (error) {
      setError('Failed to establish connection. Please try again.');
      onError(error);
    }

    // Cleanup WebSocket connection
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [sessionId, onComplete, onError]);

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
          selectedAnswer: `${selectedOption}: ${selectedText}`
        }
      ]);

      // Send answer via WebSocket
      webSocketRef.current.sendAnswer(selectedOption);
      
      // Reset selection for next question
      setSelectedOption(null);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Follow-up Questions</h2>
      
      {/* Question history */}
      {questionHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Previous Questions</h3>
          <div className="space-y-3">
            {questionHistory.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-800">{item.question}</p>
                {item.selectedAnswer && (
                  <p className="text-blue-600">You answered: {item.selectedAnswer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Current question */}
      {currentQuestion?.status === 'waiting_for_answer' ? (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
          
          <div className="space-y-3 mb-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelectOption(option.key)}
                className={`w-full text-left p-3 border rounded-md transition ${
                  selectedOption === option.key
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{option.key}:</span> {option.value}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption || isSubmitting}
            className={`w-full py-2 px-4 rounded font-medium text-white ${
              !selectedOption || isSubmitting
                ? 'bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg">Analyzing your information...</p>
        </div>
      )}
    </div>
  );
};

export default FollowUpQuestions; 