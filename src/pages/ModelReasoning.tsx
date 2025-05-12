import React from 'react';

export default function ModelReasoning() {
  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      {/* Left: Model Reasoning */}
      <div className="flex-1 p-8">
        <h2 className="text-xl font-semibold mb-6">Model Reasoning</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-700">
            The reasoning behind the provided answer is based on well-established medical literature and guidelines that describes the common symptoms associated with anemia.
          </div>
        </div>
      </div>
      {/* Right: Upload Report */}
      <aside className="w-[450px] bg-white shadow-lg p-8 flex flex-col gap-6">
        <h3 className="text-lg font-semibold mb-4">Upload Report</h3>
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
} 