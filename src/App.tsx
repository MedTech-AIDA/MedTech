import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import QuestionAnswer from './pages/QuestionAnswer.tsx';
import ModelReasoning from './pages/ModelReasoning.tsx';
import DiagnosisPage from './pages/DiagnosisPage';
import './App.css';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 hover:bg-blue-100'
      }`}
    >
      {children}
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
            <span className="material-icons mr-2">medical_services</span>
            Sehat
          </Link>
        </div>
        <div className="flex space-x-2">
          <NavLink to="/">Q&amp;A</NavLink>
          <NavLink to="/diagnosis">Diagnosis</NavLink>
          <NavLink to="/reasoning">Insights</NavLink>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<QuestionAnswer />} />
            <Route path="/reasoning/:sessionId?" element={<ModelReasoning />} />
            <Route path="/diagnosis" element={<DiagnosisPage />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="text-2xl font-bold">Sehat</div>
                <p className="text-gray-400">Advanced Medical Diagnosis System</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Resources</h3>
                  <ul className="space-y-1 text-gray-400">
                    <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
                    <li><a href="#" className="hover:text-blue-400">API Reference</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Legal</h3>
                  <ul className="space-y-1 text-gray-400">
                    <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
              © {new Date().getFullYear()} Sehat. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
