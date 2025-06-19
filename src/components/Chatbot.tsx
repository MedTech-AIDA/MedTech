import React, { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    const currentQuestion = question;
    setQuestion('');
    try {
      const response = await fetch('https://medicalbot-and-report-analyser.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });
      if (!response.ok) throw new Error('Failed to fetch answer');
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bot Icon */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open chatbot"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <span className="material-icons text-3xl">smart_toy</span>
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col" style={{ minHeight: '400px', maxHeight: '70vh' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 rounded-t-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-icons">smart_toy</span> MedTech Chatbot
            </h2>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-2xl font-bold focus:outline-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px' }}>
            {messages.length === 0 && (
              <div className="text-gray-400 text-center">Ask your medical question below!</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[75%] text-sm shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none border'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[75%] text-sm shadow bg-gray-100 text-gray-900 rounded-bl-none border flex items-center gap-2">
                  <span className="material-icons animate-spin">autorenew</span> Bot is typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t bg-white">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={loading || !question.trim()}
            >
              <span className="material-icons">send</span>
            </button>
          </form>
          {error && (
            <div className="p-2 text-red-600 text-xs text-center bg-red-50 border-t border-red-200">{error}</div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot; 