import React, { useState, useRef, useEffect } from 'react';
// import Chatbot from '../components/Chatbot';

interface Conversation {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  timestamp: Date;
}

const features = [
  {
    icon: 'smart_toy',
    title: 'AI Medical Q&A',
    desc: 'Get instant, reliable answers to your health questions from our AI-powered assistant.'
  },
  {
    icon: 'insights',
    title: 'Diagnosis Insights',
    desc: 'Receive detailed insights and explanations for your symptoms and conditions.'
  },
  {
    icon: 'description',
    title: 'Report Analysis',
    desc: 'Upload and analyze your medical reports securely and privately.'
  },
  {
    icon: 'lock',
    title: 'Secure & Private',
    desc: 'Your data is encrypted and never shared. Privacy is our top priority.'
  }
];

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
    <div className="min-h-screen bg-gray-50 pt-20 flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gradient-to-br from-blue-50 to-blue-100 relative">
        <img src="/MedTech_logo.png" alt="MedTech Logo" className="h-24 w-auto mb-4 bg-white rounded-full shadow-lg p-2" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-3">MedTech</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6 max-w-2xl">Empowering you with instant, AI-driven medical answers, diagnosis insights, and secure health tools.</p>
        <a href="#features" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Explore Features</a>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-blue-100 to-transparent pointer-events-none" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
              <span className="material-icons text-blue-600 text-4xl mb-2">{f.icon}</span>
              <h3 className="font-bold text-lg text-blue-700 mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <span className="material-icons text-blue-500 text-4xl mb-2">question_answer</span>
            <h4 className="font-semibold text-blue-700 mb-1">1. Ask</h4>
            <p className="text-gray-600 text-center">Type your medical question or upload a report.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons text-blue-500 text-4xl mb-2">psychology</span>
            <h4 className="font-semibold text-blue-700 mb-1">2. Get Answers</h4>
            <p className="text-gray-600 text-center">Receive instant, AI-powered responses and insights.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-icons text-blue-500 text-4xl mb-2">favorite</span>
            <h4 className="font-semibold text-blue-700 mb-1">3. Take Action</h4>
            <p className="text-gray-600 text-center">Use the information to make informed health decisions.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Why MedTech?</h2>
        <p className="text-gray-700 text-lg text-center mb-4">MedTech is dedicated to making healthcare information accessible, accurate, and secure for everyone. Our AI-driven platform helps you get answers, understand your health, and take control—all while keeping your data private.</p>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 flex flex-col items-center bg-blue-600">
        <h3 className="text-2xl font-bold text-white mb-3">Ready to get started?</h3>
        <a href="/" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition">Ask a Medical Question</a>
      </section>
    </div>
  );
};

export default Home;