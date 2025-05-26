import React, { useState, useRef, useEffect } from 'react';

interface Conversation {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  timestamp: Date;
}

export default function QuestionAnswer() {

  useEffect(()=>{
    window.scrollTo(0, 0);
  }, []);

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      question: 'What are the symptoms of anemia?',
      answer: 'Common symptoms of anemia include fatigue, weakness, pale skin, shortness of breath, dizziness, headache, and cold hands and feet. In severe cases, it can cause chest pain, irregular heartbeat, and cognitive problems.',
      explanation: 'The symptoms I provided are commonly associated with anemia, as derived from established medical guidelines and literature. Anemia occurs when you have a decreased level of hemoglobin in your red blood cells, reducing oxygen delivery to your tissues.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    }
  ]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Mock questions for suggestions
  const suggestedQuestions = [
    "What causes high blood pressure?",
    "How can I reduce my cholesterol?",
    "What are the symptoms of type 2 diabetes?",
    "How much exercise should I get weekly?"
  ];

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading) return;
    
    // Mock response function
    const getResponse = async (q: string) => {
      // In a real app, this would be an API call to your backend
      return new Promise<{ answer: string, explanation: string }>((resolve) => {
        setTimeout(() => {
          // Mock response data
          let response = {
            answer: "I'm not able to provide a specific answer for this question. Please consult a healthcare professional for personalized medical advice.",
            explanation: "This is a general response as I don't have specific information about this medical query."
          };
          
          // Very simple pattern matching for demo purposes
          if (q.toLowerCase().includes('headache')) {
            response = {
              answer: "Headaches can be caused by many factors including stress, dehydration, lack of sleep, eye strain, or underlying medical conditions. Common treatments include rest, hydration, over-the-counter pain relievers, and stress management techniques.",
              explanation: "This information is based on common medical knowledge about headache causes and treatments. For persistent or severe headaches, it's important to consult a healthcare provider."
            };
          } else if (q.toLowerCase().includes('covid') || q.toLowerCase().includes('coronavirus')) {
            response = {
              answer: "COVID-19 symptoms typically include fever, cough, fatigue, loss of taste or smell, sore throat, headache, and shortness of breath. If you suspect you have COVID-19, you should get tested and follow local health guidelines for isolation.",
              explanation: "This information aligns with current understanding of COVID-19 symptoms as reported by major health organizations like the WHO and CDC."
            };
          }
          
          resolve(response);
        }, 1500); // Simulate network delay
      });
    };
    
    // Add user question immediately
    const newConversation: Conversation = {
      id: Date.now().toString(),
      question: question,
      answer: '',
      timestamp: new Date()
    };
    
    setConversations(prev => [...prev, newConversation]);
    setIsLoading(true);
    setQuestion('');
    
    // Get AI response
    getResponse(question).then(response => {
      setConversations(prev => prev.map(conv => 
        conv.id === newConversation.id 
          ? {...conv, answer: response.answer, explanation: response.explanation} 
          : conv
      ));
      setIsLoading(false);
    });
  };
  
  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pb-6 sm:pb-8 lg:pb-12 relative overflow-hidden">
      <div className="mx-auto px-4 md:px-8 text-gray-700 pt-16 lg:pt-24">
        {/* Left: Q&A Section */}
        <div className="flex-1 flex flex-col min-h-[80vh]">
          <div className="bg-white rounded-t-xl shadow-md p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="material-icons mr-2 text-blue-600">question_answer</span>
              Medical Question & Answer
            </h2>
            <p className="text-sm text-gray-600 mt-1">Ask any health-related question for AI-assisted information</p>
          </div>
          
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 bg-white overflow-y-auto p-4 space-y-6"
            style={{ maxHeight: 'calc(80vh - 200px)' }}
          >
            {conversations.map((conv) => (
              <div key={conv.id} className="space-y-4">
                {/* User question */}
                <div className="flex justify-end">
                  <div className="bg-blue-100 rounded-lg rounded-tr-none py-3 px-4 max-w-[80%] relative">
                    <p className="text-gray-800">{conv.question}</p>
                    <span className="text-xs text-gray-500 block mt-1 text-right">
                      {formatTime(conv.timestamp)}
                    </span>
                  </div>
                </div>
                
                {/* AI response */}
                {conv.answer ? (
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <span className="material-icons">smart_toy</span>
                      </div>
                    </div>
                    <div className="space-y-2 max-w-[80%]">
                      <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-sm">
                        <p className="text-gray-800">{conv.answer}</p>
                        <span className="text-xs text-gray-500 block mt-1">
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                      
                      {conv.explanation && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center text-sm font-medium text-blue-900 mb-1">
                            <span className="material-icons text-blue-700 mr-1 text-sm">info</span>
                            <span>How this was derived</span>
                          </div>
                          <p className="text-blue-800 text-sm">{conv.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <span className="material-icons">smart_toy</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-sm max-w-[80%]">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-delay-100 mr-1"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator when waiting for response */}
            {isLoading && (
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <span className="material-icons">smart_toy</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="bg-white rounded-b-xl shadow-md p-4 border-t">
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your medical question..."
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className={`px-4 py-3 rounded-r-lg flex items-center justify-center ${
                  isLoading || !question.trim()
                    ? 'bg-gray-300 cursor-not-allowed text-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span className="material-icons">send</span>
              </button>
            </form>
            
            {/* Suggested questions */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Health Summary Sidebar */}
        <aside className="w-full bg-white shadow-lg rounded-xl overflow-hidden my-8">
          <div className="bg-blue-700 p-6 text-white">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <span className="material-icons mr-2">person</span>
              Health Profile
            </h3>
            <p className="text-blue-100 text-sm">Access your health information and tools</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex max-md:flex-col gap-6">
              <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="material-icons">chat</span>
                Ask a Medical Question
              </button>
              
              <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="material-icons">upload</span>
                Upload Medical Report
              </button>
              
              <button className="w-full bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors">
                <span className="material-icons">person</span>
                View Health Summary
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                <span className="material-icons mr-2 text-blue-600">history</span>
                Recent Diagnoses
              </h4>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="material-icons text-lg text-blue-600">medication</span>
                    <span className="font-medium">Iron deficiency anemia</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-7 mt-1 flex items-center justify-between">
                    <span>Jan 15, 2024</span>
                    <a href="#" className="text-blue-600 hover:underline">View</a>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="material-icons text-lg text-blue-600">medication</span>
                    <span className="font-medium">Migraine headache</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-7 mt-1 flex items-center justify-between">
                    <span>Dec 3, 2023</span>
                    <a href="#" className="text-blue-600 hover:underline">View</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                <span className="material-icons mr-2 text-blue-600">medication</span>
                Current Medications
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Ferrous sulfate</span>
                  </div>
                  <span className="text-xs text-gray-500">325 mg</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Sumatriptan</span>
                  </div>
                  <span className="text-xs text-gray-500">50 mg</span>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="flex items-center gap-1 text-blue-600 text-sm">
                  <span className="material-icons text-base">add</span>
                  Add medication
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}