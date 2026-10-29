import React, { useState } from 'react';
import { UploadCloud, FileText, Download, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const BulkUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Please upload a valid CSV file.');
    }
  };

  // Upload to FastAPI Backend
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setResults(null);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/bulk-predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setResults(data);
      } else {
        setError(data.message || 'Error processing the file.');
      }
    } catch (err) {
      setError('Connection error. Ensure FastAPI server is running.');
    }
    
    setLoading(false);
  };

  // Helper to color code the table rows
  const getRowColor = (prediction) => {
    return prediction === 1 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500';
  };

  const getStatusIcon = (prediction) => {
    return prediction === 1 
      ? <AlertTriangle size={18} className="text-red-500 inline mr-2" /> 
      : <CheckCircle size={18} className="text-green-500 inline mr-2" />;
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bulk Class Assessment</h1>
          <p className="text-gray-500 mt-1">Upload a CSV file to analyze dropout risk for an entire class instantly.</p>
        </div>
        <a 
          href="/sample_students.csv" 
          download 
          className="flex items-center gap-2 text-sm text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
        >
          <Download size={16} /> Download Sample CSV
        </a>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
          onClick={() => document.getElementById('csvUpload').click()}
        >
          <input 
            type="file" 
            id="csvUpload" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            {selectedFile ? <FileText size={40} className="text-blue-500" /> : <UploadCloud size={40} className="text-blue-500" />}
          </div>
          
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {selectedFile ? selectedFile.name : 'Click to Upload CSV'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md">
            {selectedFile 
              ? 'File selected successfully. Click analyze below.' 
              : 'Upload a CSV file containing student demographics and academic records. Ensure columns match the sample format.'}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all flex items-center gap-2
              ${!selectedFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
            ) : (
              'Analyze Class Data'
            )}
          </button>
        </div>
      </div>

      {/* Results Table Section */}
      {results && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Assessment Results</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
              {results.total_processed} Students Processed
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Student ID</th>
                  <th className="p-4 font-bold">Attendance</th>
                  <th className="p-4 font-bold">Family Income</th>
                  <th className="p-4 font-bold">AI Probability</th>
                  <th className="p-4 font-bold">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.results.map((student, index) => (
                  <tr key={index} className={`hover:bg-gray-50 transition-colors ${getRowColor(student.prediction)}`}>
                    <td className="p-4 font-bold text-gray-800">{student.id}</td>
                    <td className="p-4 text-gray-600">{student.attendance}%</td>
                    <td className="p-4 text-gray-600">{student.income}</td>
                    <td className="p-4 font-bold text-gray-800">{student.probability}%</td>
                    <td className="p-4 font-bold">
                      {getStatusIcon(student.prediction)}
                      <span className={student.prediction === 1 ? 'text-red-700' : 'text-green-700'}>
                        {student.risk_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;