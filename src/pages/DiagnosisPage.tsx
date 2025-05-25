import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>(DiagnosisStep.PATIENT_INFO);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [transition, setTransition] = useState(false);

  const handlePatientSubmit = (newSessionId: string) => {
    setTransition(true);
    setSessionId(newSessionId);

    // Add a small delay for the transition effect
    setTimeout(() => {
      setCurrentStep(DiagnosisStep.FOLLOW_UP);
      setTransition(false);
    }, 300);
  };

  const handleFollowUpComplete = () => {
    setTransition(true);

    // Add a small delay for the transition effect
    setTimeout(() => {
      setCurrentStep(DiagnosisStep.REPORT);
      setTransition(false);
    }, 300);
  };

  const handleStartNewDiagnosis = () => {
    setTransition(true);

    // Add a small delay for the transition effect
    setTimeout(() => {
      setSessionId('');
      setError(null);
      setCurrentStep(DiagnosisStep.PATIENT_INFO);
      setTransition(false);
    }, 300);
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

  const getStepName = (step: DiagnosisStep): string => {
    switch (step) {
      case DiagnosisStep.PATIENT_INFO:
        return 'Patient Information';
      case DiagnosisStep.FOLLOW_UP:
        return 'Follow-up Questions';
      case DiagnosisStep.REPORT:
        return 'Diagnosis Report';
      default:
        return 'Unknown Step';
    }
  };

  return (
    <div className="pb-6 sm:pb-8 lg:pb-12 relative overflow-hidden">
      <div className="mx-auto px-4 md:px-8 text-gray-700  pt-16 lg:pt-24">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Diagnosis System</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive analysis of your symptoms through our AI-powered medical diagnosis system
          </p>
        </header>

        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6 flex items-start">
            <span className="material-icons text-red-600 mr-3">error_outline</span>
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <button
                className="mt-2 text-red-600 underline"
                onClick={handleStartNewDiagnosis}
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{getStepName(currentStep)}</h2>
            <div className="text-sm text-gray-500">Step {currentStep + 1} of 3</div>
          </div>

          <div className="flex items-center">
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= DiagnosisStep.PATIENT_INFO
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              <span className="material-icons text-sm">person</span>
              {currentStep === DiagnosisStep.PATIENT_INFO && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </div>

            <div
              className={`h-1 flex-1 transition-all duration-500 ${currentStep > DiagnosisStep.PATIENT_INFO ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            ></div>

            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= DiagnosisStep.FOLLOW_UP
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              <span className="material-icons text-sm">question_answer</span>
              {currentStep === DiagnosisStep.FOLLOW_UP && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </div>

            <div
              className={`h-1 flex-1 transition-all duration-500 ${currentStep > DiagnosisStep.FOLLOW_UP ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            ></div>

            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= DiagnosisStep.REPORT
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              <span className="material-icons text-sm">summarize</span>
              {currentStep === DiagnosisStep.REPORT && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <div className={currentStep === DiagnosisStep.PATIENT_INFO ? 'text-blue-600 font-medium' : ''}>
              Patient Info
            </div>
            <div className={currentStep === DiagnosisStep.FOLLOW_UP ? 'text-blue-600 font-medium' : ''}>
              Questions
            </div>
            <div className={currentStep === DiagnosisStep.REPORT ? 'text-blue-600 font-medium' : ''}>
              Results
            </div>
          </div>
        </div>

        {/* Current step content with transitions */}
        <div
          className={`transition-opacity duration-300 ${transition ? 'opacity-0 transform -translate-y-4' : 'opacity-100'
            }`}
        >
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
              <div className="mt-8 text-center">
                <button
                  onClick={handleViewReasoning}
                  className="inline-flex items-center px-6 py-3 border border-blue-700 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="material-icons mr-2">lightbulb</span>
                  View Diagnostic Reasoning
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  See how our AI arrived at this diagnosis based on your symptoms and answers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisPage;