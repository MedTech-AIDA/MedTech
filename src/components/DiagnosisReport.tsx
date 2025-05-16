import React, { useState } from 'react';
import { generateReport } from '../services/api';

interface DiagnosisReportProps {
  sessionId: string;
  onNewDiagnosis: () => void;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ sessionId, onNewDiagnosis }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const reportBlob = await generateReport(sessionId);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(reportBlob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnosis-report-${sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-green-600 text-2xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Diagnosis Complete</h2>
        <p className="text-gray-600 mb-6">
          We've completed your diagnosis based on the information provided. You can now download your detailed medical report.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={handleDownloadReport}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white flex items-center justify-center ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <span className="material-icons mr-2">download</span>
          {isLoading ? 'Downloading...' : 'Download Diagnosis Report'}
        </button>
        
        <button
          onClick={onNewDiagnosis}
          className="w-full py-3 px-4 rounded-md font-medium text-blue-600 bg-white border border-blue-600 hover:bg-blue-50"
        >
          Start New Diagnosis
        </button>
      </div>
    </div>
  );
};

export default DiagnosisReport; 