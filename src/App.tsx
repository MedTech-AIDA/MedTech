import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ModelReasoning from './pages/ModelReasoning';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';
import Navbar from './pages/Navbar.tsx';
import Footer from './pages/Footer.tsx';
import Contact from './pages/Contact.tsx';
import About from './pages/About.tsx';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Navbar/>
      <Chatbot />
      <div className="pt-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
