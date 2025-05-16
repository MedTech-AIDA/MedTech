import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuestionAnswer from './pages/QuestionAnswer.tsx';
import ModelReasoning from './pages/ModelReasoning.tsx';
import DiagnosisPage from './pages/DiagnosisPage';

function App() {
  return (
    <Router>
      <nav className="bg-white shadow flex items-center px-8 py-4 gap-6">
        <Link to="/" className="text-lg font-bold text-blue-600">Medical LLM</Link>
        <Link to="/" className="text-gray-700 hover:text-blue-600">Q&amp;A</Link>
        <Link to="/reasoning" className="text-gray-700 hover:text-blue-600">Model Reasoning</Link>
        <Link to="/diagnosis" className="text-gray-700 hover:text-blue-600">Diagnosis System</Link>
      </nav>
      <Routes>
        <Route path="/" element={<QuestionAnswer />} />
        <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
