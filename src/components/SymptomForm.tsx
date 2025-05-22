import React, { useState } from 'react';
import { api } from '../services/api';
import type { PatientData } from '../services/api';

interface SymptomFormProps {
  onSessionStart: (sessionId: string) => void;
  onError: (error: any) => void;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSessionStart, onError }) => {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: 0,
    gender: '',
    symptoms: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.submitSymptoms(formData);
      onSessionStart(response.session_id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymptomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const symptoms = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, symptoms }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Initial Assessment</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={formData.age || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
            required
            min="0"
            max="120"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
            Symptoms (comma-separated)
          </label>
          <input
            type="text"
            id="symptoms"
            value={formData.symptoms.join(', ')}
            onChange={handleSymptomChange}
            required
            placeholder="e.g., fever, headache, cough"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Start Assessment'}
        </button>
      </form>
    </div>
  );
};

export default SymptomForm; 