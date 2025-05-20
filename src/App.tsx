import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionAnswer from './pages/QuestionAnswer';
import ModelReasoning from './pages/ModelReasoning';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';
import Navbar from './pages/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<QuestionAnswer />} />
        <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
