import React, { useState, useRef, useEffect } from 'react';
// import Chatbot from '../components/Chatbot';

interface Conversation {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  timestamp: Date;
}

const Home: React.FC = () => {

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
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Chatbot is now a floating widget */}
    </div>
  );
};

export default Home;