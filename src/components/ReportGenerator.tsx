import React, { useState } from 'react';
import axios from 'axios';

interface ReportGeneratorProps {
  sessionId: string;
  onError: (error: any) => void;
}

const API_BASE_URL = 'https://medical-diagnosis-smwn.onrender.com';

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ sessionId, onError }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadProgress(0);

    try {
      const response = await axios.get(`${API_BASE_URL}/generate_report/${sessionId}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setDownloadProgress(progress);
        }
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnosis-report-${sessionId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate report';
      setError(errorMessage);
      onError(error);
    } finally {
      setIsGenerating(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Diagnosis Report</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isGenerating
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isGenerating ? 'Generating Report...' : 'Download Diagnosis Report'}
        </button>

        {isGenerating && downloadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        )}

        <p className="text-sm text-gray-600 text-center">
          The report will contain your symptoms, diagnosis, and recommended treatments.
        </p>
      </div>
    </div>
  );
};

export default ReportGenerator; 