import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ModelReasoning from './pages/ModelReasoning';

function App() {
  return (
    <Router>
      <nav className="bg-white shadow flex items-center px-8 py-4 gap-6">
        <Link to="/" className="text-lg font-bold text-blue-600">Medical</Link>
        <Link to="/" className="text-gray-700 hover:text-blue-600">Q&amp;A</Link>
        <Link to="/reasoning" className="text-gray-700 hover:text-blue-600">Model Reasoning</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reasoning" element={<ModelReasoning />} />
      </Routes>
    </Router>
  );
}

export default App; 