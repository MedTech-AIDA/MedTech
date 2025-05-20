import React, { useState } from 'react';
import { submitPatientData } from '../services/api';
import type { PatientData } from '../services/api';

interface PatientFormProps {
  onSubmitSuccess: (sessionId: string) => void;
  onError: (error: any) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmitSuccess, onError }) => {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: 0,
    gender: '',
    symptoms: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formTouched, setFormTouched] = useState({
    name: false,
    age: false,
    gender: false,
    symptoms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    setFormTouched({
      name: true,
      age: true,
      gender: true,
      symptoms: true
    });

    // Check for validation errors
    if (!formData.name || !formData.age || !formData.gender || !formData.symptoms) {
      console.log('Form validation failed:', {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        symptoms: formData.symptoms
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Submitting form data:', formData);
      
      const response = await submitPatientData(formData);
      console.log('Form submission successful:', response);
      
      onSubmitSuccess(response.session_id);
    } catch (error) {
      console.error('Form submission error:', {
        error,
        formData
      });
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <span className="material-icons text-xl">person</span>
            </span>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all 
                ${formTouched.name && !formData.name 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`}
              placeholder="Enter your full name"
            />
          </div>
          {formTouched.name && !formData.name && (
            <p className="mt-1 text-sm text-red-600">Please enter your name</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <span className="material-icons text-xl">calendar_today</span>
              </span>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                value={formData.age || ''}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all 
                  ${formTouched.age && !formData.age 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`}
                placeholder="Enter your age"
              />
            </div>
            {formTouched.age && !formData.age && (
              <p className="mt-1 text-sm text-red-600">Please enter your age</p>
            )}
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <span className="material-icons text-xl">wc</span>
              </span>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all appearance-none bg-white 
                  ${formTouched.gender && !formData.gender 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <span className="material-icons">expand_more</span>
              </div>
            </div>
            {formTouched.gender && !formData.gender && (
              <p className="mt-1 text-sm text-red-600">Please select your gender</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your symptoms
          </label>
          <div className="relative">
            <textarea
              id="symptoms"
              name="symptoms"
              rows={5}
              value={formData.symptoms}
              onChange={handleChange}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:outline-none transition-all 
                ${formTouched.symptoms && !formData.symptoms 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`}
              placeholder="Please describe your symptoms in detail. Include when they started, their severity, and any factors that make them better or worse."
            />
          </div>
          {formTouched.symptoms && !formData.symptoms && (
            <p className="mt-1 text-sm text-red-600">Please describe your symptoms</p>
          )}
        </div>
        
        <div className="flex items-center pt-4">
          <input
            id="privacy-policy"
            name="privacy-policy"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-900">
            I agree to the <a href="#" className="text-blue-600 hover:underline">privacy policy</a> and consent to sharing my health information.
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${
            isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="material-icons mr-2">medical_services</span>
              Submit Symptoms
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;