import React, { useState } from 'react';
import { 
  User, MapPin, Navigation, Users, Wallet, GraduationCap, 
  Wifi, BookOpen, Percent, CheckCircle, AlertTriangle 
} from 'lucide-react';

const Prediction = () => {
  // Now we take ALL 12 inputs from the user, NO dummy data!
  const [formData, setFormData] = useState({
    Gender: 'Male',
    Region: 'Rural',
    Distance_km: 5.0,
    No_of_Siblings: 2,
    Family_Income: '< 1 Lakh',
    Father_Education: '10th Pass',
    Mother_Education: '10th Pass',
    Internet_Access: 'Yes',
    Stream: 'Arts',
    Class_10_Percentage: 65.0,
    Class_11_Percentage: 60.0,
    Attendance_Percentage: 75.0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric fields from string to float/int
    const numericFields = ['Distance_km', 'No_of_Siblings', 'Class_10_Percentage', 'Class_11_Percentage', 'Attendance_Percentage'];
    setFormData({ 
      ...formData, 
      [name]: numericFields.includes(name) ? Number(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); // Clear previous result
    try {
      // Sending real user input to FastAPI Backend
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error connecting to backend! Ensure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Predict Student Dropout Risk</h1>
        <p className="text-gray-500 mt-1">Enter the student's complete profile to get an AI-driven risk assessment.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- FORM SECTION --- */}
        <div className="lg:w-2/3 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Demographics & Location */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4">Demographics & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><User size={16} className="text-blue-500"/> Gender</label>
                  <select name="Gender" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><MapPin size={16} className="text-blue-500"/> Region</label>
                  <select name="Region" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Navigation size={16} className="text-blue-500"/> Distance to School (km)</label>
                  <input type="number" step="0.1" name="Distance_km" value={formData.Distance_km} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Wifi size={16} className="text-blue-500"/> Internet Access at Home</label>
                  <select name="Internet_Access" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Profile */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4">Academic Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><BookOpen size={16} className="text-blue-500"/> Stream</label>
                  <select name="Stream" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Percent size={16} className="text-blue-500"/> Class 10 Percentage</label>
                  <input type="number" step="0.1" name="Class_10_Percentage" value={formData.Class_10_Percentage} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Percent size={16} className="text-blue-500"/> Class 11 Percentage</label>
                  <input type="number" step="0.1" name="Class_11_Percentage" value={formData.Class_11_Percentage} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><User size={16} className="text-blue-500"/> Attendance Percentage</label>
                  <input type="number" step="0.1" name="Attendance_Percentage" value={formData.Attendance_Percentage} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Section 3: Socio-Economic Background */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 border-b pb-2 mb-4">Socio-Economic Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Wallet size={16} className="text-blue-500"/> Family Annual Income</label>
                  <select name="Family_Income" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="< 1 Lakh">{"< 1 Lakh"}</option>
                    <option value="1-3 Lakhs">1-3 Lakhs</option>
                    <option value="3-5 Lakhs">3-5 Lakhs</option>
                    <option value="> 5 Lakhs">{"> 5 Lakhs"}</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Users size={16} className="text-blue-500"/> Number of Siblings</label>
                  <input type="number" name="No_of_Siblings" value={formData.No_of_Siblings} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><GraduationCap size={16} className="text-blue-500"/> Father's Education</label>
                  <select name="Father_Education" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Illiterate">Illiterate</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><GraduationCap size={16} className="text-blue-500"/> Mother's Education</label>
                  <select name="Mother_Education" onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="Illiterate">Illiterate</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white p-4 rounded-xl hover:bg-blue-800 font-bold text-lg shadow-md transition-all flex justify-center items-center gap-2">
              {loading ? "Analyzing via Machine Learning..." : "Generate AI Prediction"}
            </button>
          </form>
        </div>

        {/* --- RESULT SECTION (Sidebar) --- */}
        <div className="lg:w-1/3">
          <div className="sticky top-8">
            {!result && !loading && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-gray-200 p-4 rounded-full mb-4">
                  <User size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Prediction Yet</h3>
                <p className="text-gray-500 text-sm">Fill all the details and click the button to generate a risk assessment for this student.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-10 flex flex-col items-center justify-center text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-blue-900">Processing Data</h3>
                <p className="text-gray-500 text-sm">Running Ensemble ML Model...</p>
              </div>
            )}

            {result && !loading && (
              <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${result.prediction === 1 ? 'border-red-500' : 'border-green-500'}`}>
                {/* Result Header */}
                <div className={`p-6 text-center ${result.prediction === 1 ? 'bg-red-50' : 'bg-green-50'}`}>
                  {result.prediction === 1 ? (
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-3" />
                  ) : (
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  )}
                  <h2 className={`text-2xl font-black uppercase tracking-wider ${result.prediction === 1 ? 'text-red-700' : 'text-green-700'}`}>
                    {result.risk_status}
                  </h2>
                </div>
                
                {/* Result Body */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-bold">Dropout Probability:</span>
                    <span className="text-2xl font-black text-gray-800">{result.dropout_probability}%</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 mb-2 font-bold">AI Recommendation:</p>
                    {result.prediction === 1 ? (
                      <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        This student exhibits high vulnerability indicators. Immediate counseling and financial/academic intervention is recommended.
                      </p>
                    ) : (
                      <p className="text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                        This student is on a stable academic track. Regular monitoring is sufficient; no immediate intervention required.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Prediction;