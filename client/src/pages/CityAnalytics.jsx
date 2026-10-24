import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const CityAnalytics = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);

  const COLORS = {
    safe: '#10B981', 
    danger: '#EF4444', 
    primary: '#3B82F6', 
  };

  // Fetch list of cities on initial load
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/cities');
        const data = await response.json();
        setCities(data.cities);
        if (data.cities.length > 0) {
          setSelectedCity(data.cities[0]); // Select first city by default
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  // Fetch city specific analytics when selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchCityData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/city-analytics/${selectedCity}`);
        const data = await response.json();
        setCityData(data);
      } catch (error) {
        console.error("Error fetching city analytics:", error);
      }
      setLoading(false);
    };

    fetchCityData();
  }, [selectedCity]);

  return (
    <div className="w-full pb-10">
      
      {/* Header and Dropdown Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">City Insights</h1>
          <p className="text-gray-500 mt-1">Deep dive into local dropout metrics</p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-72">
          <label className="block text-sm font-bold text-gray-700 mb-1">Select District / City</label>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 font-medium text-gray-800 cursor-pointer"
          >
            {cities.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 font-bold animate-pulse">Loading data for {selectedCity}...</p>}

      {!loading && cityData && !cityData.error && (
        <>
          {/* Mini Overview Cards for the City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <h3 className="text-blue-800 text-sm font-bold uppercase">Total Students in {selectedCity}</h3>
              <p className="text-4xl font-black text-blue-900 mt-2">{cityData.overview.total_students}</p>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <h3 className="text-red-800 text-sm font-bold uppercase">Total Dropouts in {selectedCity}</h3>
              <p className="text-4xl font-black text-red-900 mt-2">{cityData.overview.total_dropouts}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Gender Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Gender Distribution</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData.charts.gender} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Legend />
                    <Bar dataKey="Safe" fill={COLORS.safe} radius={[4, 4, 0, 0]} barSize={50} />
                    <Bar dataKey="Dropout" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Region (Urban/Rural) Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Area Context (Urban vs Rural)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData.charts.region} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Legend />
                    <Bar dataKey="Safe" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={50} />
                    <Bar dataKey="Dropout" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Income Logic */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Dropout Rate by Income Level</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cityData.charts.income} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="income" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="DropoutRate" name="Dropout Rate (%)" stroke={COLORS.danger} strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Parent Education Logic */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Dropout Rate by Father's Education</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={cityData.charts.education} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="education" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Bar dataKey="DropoutRate" name="Dropout Rate (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default CityAnalytics;