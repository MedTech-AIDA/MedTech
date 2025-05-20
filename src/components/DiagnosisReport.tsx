import React, { useState } from 'react';
import { generateReport } from '../services/api';

interface DiagnosisReportProps {
  sessionId: string;
  onNewDiagnosis: () => void;
}

const DiagnosisReport: React.FC<DiagnosisReportProps> = ({ sessionId, onNewDiagnosis }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDownloadProgress(0);
      
      console.log('Attempting to generate report for session:', sessionId);
      const reportBlob = await generateReport(sessionId, (progress) => {
        setDownloadProgress(progress);
      });
      
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
      
      // Mark as downloaded
      setIsDownloaded(true);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setDownloadProgress(0);
      }, 1500);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-green-600 text-4xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Diagnosis Complete</h2>
        <p className="text-green-100">
          Thank you for completing the diagnosis process. Your report is ready.
        </p>
      </div>
      
      {/* Body */}
      <div className="p-8">
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <span className="material-icons text-green-600 mr-3 text-xl">info</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Next Steps</h3>
              <p className="text-gray-700">
                We've analyzed your symptoms and created a detailed report. Please download
                and share it with your healthcare provider for a comprehensive evaluation.
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6 flex items-start">
            <span className="material-icons text-red-600 mr-3">error_outline</span>
            <div>
              <p className="font-medium">Error downloading report</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="material-icons text-gray-500 mr-3">description</span>
                <div>
                  <h4 className="font-medium text-gray-900">Diagnosis Report</h4>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {isDownloaded ? 'Downloaded' : 'Ready to download'}
              </div>
            </div>
            
            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Downloading...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleDownloadReport}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold shadow transition-all flex items-center justify-center ${
                isLoading 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">download</span>
                  Download Diagnosis Report
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onNewDiagnosis}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center"
            >
              <span className="material-icons mr-2">add</span>
              Start New Diagnosis
            </button>
            
            <button
              onClick={() => {
                // Open email client with pre-filled subject
                const subject = 'Medical Diagnosis Report';
                const body = 'Please find attached my medical diagnosis report from Sehat.';
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-green-600 bg-white border border-green-600 hover:bg-green-50 transition-all flex items-center justify-center"
            >
              <span className="material-icons mr-2">email</span>
              Email Report to Doctor
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Need help understanding your report?{' '}
              <a href="#" className="text-blue-600 hover:underline">Talk to a healthcare advisor</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisReport;