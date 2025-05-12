import React from 'react';

export default function QuestionAnswer() {
  return (
    <div className="flex min-h-screen w-screen bg-[#f7fafc]">
      {/* Left: Q&A Section */}
      <div className="flex-1 p-8">
        <h2 className="text-xl font-semibold mb-6">Question &amp; Answer</h2>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-start mb-4">
            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold text-lg">A</div>
            <div>
              <div className="font-medium text-gray-700 mb-1">What are the symptoms of anemia?</div>
              <div className="bg-gray-50 rounded p-3 text-gray-700">Common symptoms of anemia include fatigue, weakness, pale skin, shortness of breath, dizziness, and headache.</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded p-3 mt-2">
            <div className="font-semibold text-blue-900 mb-1">How this was derived</div>
            <div className="text-blue-900 text-sm">The symptoms I provided are commonly associated with anemia, as derived from established medical guidelines and literature.</div>
          </div>
        </div>
        <div className="mt-6">
          <input type="text" placeholder="Type your question..." className="w-2/3 p-3 border rounded-l focus:outline-none" />
          <button className="bg-blue-500 text-white px-4 py-3 rounded-r hover:bg-blue-600">&rarr;</button>
        </div>
      </div>
      {/* Right: Health Summary Sidebar */}
      <aside className="w-[350px] bg-white shadow-lg p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Health Summary</h3>
          <button className="w-full bg-blue-500 text-white py-2 rounded mb-2 font-medium flex items-center justify-center gap-2"><span className="material-icons">chat</span>Ask a Medical Question</button>
          <button className="w-full bg-blue-500 text-white py-2 rounded mb-2 font-medium flex items-center justify-center gap-2"><span className="material-icons">upload</span>Upload Report</button>
          <button className="w-full bg-blue-500 text-white py-2 rounded font-medium flex items-center justify-center gap-2"><span className="material-icons">person</span>View My Health Summary</button>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Past Diagnoses</h4>
          <div className="flex items-center gap-2 text-gray-700 mb-1"><span className="material-icons text-lg">stethoscope</span>Iron deficiency anemia</div>
          <div className="text-xs text-gray-500 ml-7">Jan 15, 2024</div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Medications</h4>
          <div className="flex items-center gap-2 text-gray-700 mb-1"><span className="material-icons text-lg">medication</span>Ferrous sulfate <span className="text-xs text-gray-500 ml-2">325 mg</span></div>
          <button className="flex items-center gap-1 text-blue-600 mt-2"><span className="material-icons text-base">attach_file</span>Upload Document</button>
        </div>
      </aside>
    </div>
  );
} 