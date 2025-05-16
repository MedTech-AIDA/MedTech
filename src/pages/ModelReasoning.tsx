import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface DiagnosisNode {
  id: string;
  question: string;
  answer?: string;
  confidence: number;
  children: DiagnosisNode[];
}

interface SymptomMapping {
  symptom: string;
  conditions: Array<{
    name: string;
    likelihood: number;
    description: string;
  }>;
}

const ModelReasoning: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [diagnosisTree, setDiagnosisTree] = useState<DiagnosisNode | null>(null);
  const [symptomMappings, setSymptomMappings] = useState<SymptomMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Example data - in a real app, fetch this from your API
  useEffect(() => {
    const fetchDiagnosisData = async () => {
      try {
        setLoading(true);
        // In a real implementation, replace with actual API call
        // const response = await axios.get(`http://127.0.0.1:8000/diagnosis-reasoning/${sessionId}`);
        
        // Demo data for visualization
        const mockTree: DiagnosisNode = {
          id: "root",
          question: "Patient presents with fatigue, shortness of breath",
          confidence: 1.0,
          children: [
            {
              id: "node1",
              question: "Does patient have pale skin?",
              answer: "Yes",
              confidence: 0.8,
              children: [
                {
                  id: "node3",
                  question: "Does patient have low hemoglobin?",
                  answer: "Yes",
                  confidence: 0.9,
                  children: []
                }
              ]
            },
            {
              id: "node2",
              question: "Is patient experiencing dizziness?",
              answer: "Yes",
              confidence: 0.7,
              children: []
            }
          ]
        };
        
        const mockSymptoms: SymptomMapping[] = [
          {
            symptom: "Fatigue",
            conditions: [
              { name: "Anemia", likelihood: 0.85, description: "Reduced red blood cell count" },
              { name: "Hypothyroidism", likelihood: 0.45, description: "Underactive thyroid" },
              { name: "Depression", likelihood: 0.30, description: "Mood disorder" }
            ]
          },
          {
            symptom: "Shortness of breath",
            conditions: [
              { name: "Anemia", likelihood: 0.75, description: "Reduced red blood cell count" },
              { name: "Asthma", likelihood: 0.60, description: "Chronic lung condition" },
              { name: "Heart failure", likelihood: 0.25, description: "Heart unable to pump efficiently" }
            ]
          },
          {
            symptom: "Pale skin",
            conditions: [
              { name: "Anemia", likelihood: 0.90, description: "Reduced red blood cell count" },
              { name: "Shock", likelihood: 0.15, description: "Circulatory failure" }
            ]
          }
        ];
        
        setDiagnosisTree(mockTree);
        setSymptomMappings(mockSymptoms);
      } catch (err) {
        console.error("Error fetching diagnosis reasoning:", err);
        setError("Failed to load diagnostic reasoning data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiagnosisData();
  }, [sessionId]);
  
  // Render a node in the decision tree
  const renderTreeNode = (node: DiagnosisNode, depth: number = 0) => {
    return (
      <div key={node.id} className="mb-3" style={{ marginLeft: `${depth * 24}px` }}>
        <div 
          className={`p-3 rounded-md border-l-4 ${
            depth === 0 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-white border-gray-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">{node.question}</p>
            <span 
              className={`text-sm px-2 py-1 rounded-full ${
                node.confidence > 0.7 
                  ? 'bg-green-100 text-green-800' 
                  : node.confidence > 0.4 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {Math.round(node.confidence * 100)}% confidence
            </span>
          </div>
          {node.answer && (
            <div className="mt-1 text-sm text-blue-600">
              Answer: {node.answer}
            </div>
          )}
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="mt-2 ml-2 pl-4 border-l-2 border-gray-200">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading diagnostic reasoning...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      {/* Left: Model Reasoning */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold mb-6">Diagnostic Reasoning</h2>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Decision Path</h3>
          <p className="text-gray-600 mb-4">
            The diagnostic model uses a tree-based approach to determine the most likely diagnosis
            based on the patient's symptoms and responses to follow-up questions.
          </p>
          
          <div className="mt-4">
            {diagnosisTree && renderTreeNode(diagnosisTree)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Symptom Analysis</h3>
          <p className="text-gray-600 mb-4">
            Each symptom contributes to the likelihood of different conditions. Below is the
            breakdown of symptoms and their associated conditions.
          </p>
          
          <div className="space-y-4 mt-6">
            {symptomMappings.map((mapping, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 p-3 font-medium border-b">
                  Symptom: {mapping.symptom}
                </div>
                <div className="divide-y">
                  {mapping.conditions.map((condition, condIndex) => (
                    <div key={condIndex} className="p-3 flex items-center">
                      <div className="flex-1">
                        <p className="font-medium">{condition.name}</p>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-4 mr-2">
                            <div 
                              className={`h-4 rounded-full ${
                                condition.likelihood > 0.7 
                                  ? 'bg-green-500' 
                                  : condition.likelihood > 0.4 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${condition.likelihood * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {Math.round(condition.likelihood * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right: Upload Report */}
      <aside className="w-[450px] bg-white shadow-lg p-8 flex flex-col gap-6">
        <h3 className="text-2xl font-semibold mb-4 text-black">Upload Report</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button className="bg-blue-500 text-white rounded-lg p-6 flex flex-col items-center hover:bg-blue-600">
            <span className="material-icons text-3xl mb-2">prescriptions</span>
            <span className="font-medium">Prescription</span>
          </button>
          <button className="bg-blue-500 text-white rounded-lg p-6 flex flex-col items-center hover:bg-blue-600">
            <span className="material-icons text-3xl mb-2">science</span>
            <span className="font-medium">Lab Report</span>
          </button>
        </div>
        <button className="bg-blue-500 text-white rounded-lg p-6 flex flex-col items-center hover:bg-blue-600">
          <span className="material-icons text-3xl mb-2">add</span>
          <span className="font-medium">Upload</span>
        </button>
      </aside>
    </div>
  );
};

export default ModelReasoning; 