import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import FollowUpQuestions from '../components/FollowUpQuestions';
import DiagnosisReport from '../components/DiagnosisReport';

enum DiagnosisStep {
  PATIENT_INFO,
  FOLLOW_UP,
  REPORT
}

const DiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>(DiagnosisStep.PATIENT_INFO);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handlePatientSubmit = (newSessionId: string) => {
    setSessionId(newSessionId);
    setCurrentStep(DiagnosisStep.FOLLOW_UP);
  };

  const handleFollowUpComplete = () => {
    setCurrentStep(DiagnosisStep.REPORT);
  };

  const handleStartNewDiagnosis = () => {
    setSessionId('');
    setError(null);
    setCurrentStep(DiagnosisStep.PATIENT_INFO);
  };
  
  const handleViewReasoning = () => {
    if (sessionId) {
      navigate(`/reasoning/${sessionId}`);
    }
  };

  const handleError = (err: any) => {
    console.error('Error in diagnosis process:', err);
    setError('An error occurred. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Diagnosis System</h1>
          <p className="text-gray-600">
            Get a comprehensive analysis of your symptoms and a detailed medical report
          </p>
        </header>

        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button 
              className="mt-2 text-red-600 underline"
              onClick={handleStartNewDiagnosis}
            >
              Start Over
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= DiagnosisStep.PATIENT_INFO ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              currentStep > DiagnosisStep.PATIENT_INFO ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= DiagnosisStep.FOLLOW_UP ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${
              currentStep > DiagnosisStep.FOLLOW_UP ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= DiagnosisStep.REPORT ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Current step content */}
        <div className="transition-all duration-300">
          {currentStep === DiagnosisStep.PATIENT_INFO && (
            <PatientForm 
              onSubmitSuccess={handlePatientSubmit} 
              onError={handleError} 
            />
          )}
          
          {currentStep === DiagnosisStep.FOLLOW_UP && sessionId && (
            <FollowUpQuestions 
              sessionId={sessionId} 
              onComplete={handleFollowUpComplete} 
              onError={handleError} 
            />
          )}
          
          {currentStep === DiagnosisStep.REPORT && sessionId && (
            <div>
              <DiagnosisReport 
                sessionId={sessionId} 
                onNewDiagnosis={handleStartNewDiagnosis} 
              />
              <div className="mt-4 text-center">
                <button
                  onClick={handleViewReasoning}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Diagnostic Reasoning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisPage; 