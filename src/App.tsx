import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionAnswer from './pages/QuestionAnswer.tsx';
import ModelReasoning from './pages/ModelReasoning.tsx';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';
import Navbar from './pages/Navbar.tsx';
import Footer from './pages/Footer.tsx';

// function Navigation() {
//   return (
    
//   );
// }

function App() {
  return (
    <Router>
      {/* <Navigation /> */}
      <Navbar/>

      <Routes>
        <Route path="/" element={<QuestionAnswer />} />
        <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
      </Routes>

      <Footer/>

    </Router>
  );
}

export default App;
