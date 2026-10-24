import { useState } from 'react';

const Prediction = () => {
  const [formData, setFormData] = useState({
    Gender: 'Male', Region: 'Rural', Distance_km: 5, No_of_Siblings: 2,
    Family_Income: '< 1 Lakh', Father_Education: '10th Pass', Mother_Education: '10th Pass',
    Internet_Access: 'Yes', Stream: 'Arts', Class_10_Percentage: 60, Class_11_Percentage: 55, Attendance_Percentage: 70
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend error! Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Predict Student Dropout Risk</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields... Keeping it same as before */}
          <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="Gender" onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"><option value="Male">Male</option><option value="Female">Female</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">Region</label><select name="Region" onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"><option value="Urban">Urban</option><option value="Rural">Rural</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">Distance (km)</label><input type="number" name="Distance_km" value={formData.Distance_km} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Income</label><select name="Family_Income" onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"><option value="< 1 Lakh">{"< 1 Lakh"}</option><option value="1-3 Lakhs">1-3 Lakhs</option><option value="3-5 Lakhs">3-5 Lakhs</option><option value="> 5 Lakhs">{"> 5 Lakhs"}</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">Attendance (%)</label><input type="number" name="Attendance_Percentage" value={formData.Attendance_Percentage} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Class 11 (%)</label><input type="number" name="Class_11_Percentage" value={formData.Class_11_Percentage} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Stream</label><select name="Stream" onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"><option value="Arts">Arts</option><option value="Science">Science</option><option value="Commerce">Commerce</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">Internet</label><select name="Internet_Access" onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"><option value="Yes">Yes</option><option value="No">No</option></select></div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-bold transition">
              {loading ? "Analyzing Data..." : "Predict Risk"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className={`mt-8 p-6 rounded-xl text-center shadow-md ${result.prediction === 1 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
          <h2 className={`text-2xl font-bold mb-2 ${result.prediction === 1 ? 'text-red-700' : 'text-green-700'}`}>{result.risk_status}</h2>
          <p className="text-lg">Dropout Probability: <span className="font-bold">{result.dropout_probability}%</span></p>
        </div>
      )}
    </div>
  );
};

export default Prediction;