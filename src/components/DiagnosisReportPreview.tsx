import React, { useEffect, useState } from 'react';

interface DiagnosisReportPreviewProps {
  sessionId: string;
}

const API_BASE_URL = 'https://medical-diagnosis-smwn.onrender.com';

const DiagnosisReportPreview: React.FC<DiagnosisReportPreviewProps> = ({ sessionId }) => {
  const [report, setReport] = useState<any>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/generate_report/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch report');
        const data = await res.json();
        setReport(data.report);
        setPatientName(data.patient_details?.name || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="text-center py-8">Loading report preview...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!report) return <div className="text-center text-gray-500 py-8">No report data available.</div>;

  return (
    <div className="bg-green-50 border border-green-300 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-2 text-green-800">Diagnosis Report Summary</h3>
      {patientName && (
        <div className="mb-2"><span className="font-semibold">Patient Name:</span> {patientName}</div>
      )}
      <div className="mb-4">
        <span className="font-semibold">Patient Info:</span> Age: {report.PatientInfo?.Age}, Gender: {report.PatientInfo?.Gender}
      </div>
      <div className="mb-2"><span className="font-semibold">Urgency:</span> {report.Urgency}</div>
      <div className="mb-2"><span className="font-semibold">Recommendation:</span> {report.Recommendation}</div>
      <div className="mb-2"><span className="font-semibold">Reason for Consultation:</span> {report.ReasonForConsultation}</div>
      <div className="mb-4">
        <span className="font-semibold">Main Symptoms:</span>
        <ul className="list-disc ml-6">
          {report.MainSymptoms?.map((symptom: string, idx: number) => (
            <li key={idx}>{symptom}</li>
          ))}
        </ul>
      </div>
      <div>
        <span className="font-semibold">Top Disease Matches:</span>
        <ol className="list-decimal ml-6">
          {report.TopDiseaseMatches?.map((diseaseObj: any, i: number) => {
            const diseaseKey = Object.keys(diseaseObj)[0];
            const disease = diseaseObj[diseaseKey];
            const num = diseaseKey.replace('Disease', '');
            return (
              <li key={diseaseKey} className="mb-2">
                <div className="font-semibold">{disease[`Name${num}`]} <span className="text-xs text-gray-600">({disease[`MatchLevel${num}`]})</span></div>
                {disease[`PreHospitalCare${num}`] && (
                  <div><span className="italic">Pre-Hospital Care:</span>
                    <ul className="list-disc ml-6">
                      {disease[`PreHospitalCare${num}`].map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {disease[`SymptomsToWatch${num}`] && (
                  <div><span className="italic">Symptoms To Watch:</span>
                    <ul className="list-disc ml-6">
                      {disease[`SymptomsToWatch${num}`].map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {disease[`SelfCare${num}`] && (
                  <div><span className="italic">Self Care:</span>
                    <ul className="list-disc ml-6">
                      {disease[`SelfCare${num}`].map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {disease[`MedicationSuggestion${num}`] && (
                  <div><span className="italic">Medication Suggestions:</span>
                    <ul className="list-disc ml-6">
                      {disease[`MedicationSuggestion${num}`].map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default DiagnosisReportPreview;
