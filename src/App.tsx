import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ModelReasoning from './pages/ModelReasoning';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';
import Navbar from './pages/Navbar.tsx';
import Footer from './pages/Footer.tsx';
import Contact from './pages/Contact.tsx';
import About from './pages/About.tsx';
import Chatbot from './components/Chatbot';
import Registration from './auth/registration';
import Login from './auth/login';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Chatbot />}
      <div className={isAuthPage ? '' : 'pt-5'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        {!isAuthPage && <Footer />}
      </div>
    </>
  );
}

export default App;
