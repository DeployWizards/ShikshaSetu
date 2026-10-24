import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  // State to hold the real data from Backend
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from FastAPI when the component loads
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/analytics');
        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Colors for charts
  const COLORS = {
    safe: '#10B981', // Emerald Green
    danger: '#EF4444', // Red
    urban: '#3B82F6', // Blue
    rural: '#F59E0B', // Amber/Orange
  };
  const PIE_COLORS = [COLORS.rural, COLORS.urban];

  // Show a loading screen while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <h2 className="text-2xl font-bold text-gray-400 animate-pulse">Loading Real Analytics from Server...</h2>
      </div>
    );
  }

  // If backend fails or server is off
  if (!dashboardData || dashboardData.error) {
    return (
      <div className="flex items-center justify-center h-full w-full text-red-500 font-bold">
        Error loading data. Please ensure FastAPI server is running.
      </div>
    );
  }

  const { kpi, charts } = dashboardData;

  return (
    <div className="w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Overview</h1>
        <p className="text-gray-500 mt-1">Real-time analysis based on {kpi.total_students} student records from Uttar Pradesh</p>
      </div>
      
      {/* --- KPI CARDS (Real Data) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Students Analyzed</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.total_students.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Historical Dropouts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{kpi.total_dropouts.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Overall Dropout Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{kpi.dropout_rate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Model Accuracy</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{kpi.accuracy}%</p>
        </div>
      </div>

      {/* --- CHARTS GRID (Real Data) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* 1. District-wise Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4">District-wise Dropout Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.district} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="city" tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Safe" stackId="a" fill={COLORS.safe} radius={[0, 0, 4, 4]} barSize={40} />
                <Bar dataKey="Dropout" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Income Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Impact of Family Income on Dropout Rate</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.income} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="income" tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="DropoutRate" name="Dropout Rate (%)" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Gender Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Gender Disparity in Education Continuity</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.gender} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="gender" type="category" tick={{fill: '#6B7280', fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Safe" fill={COLORS.safe} barSize={30} radius={[0, 4, 4, 0]} />
                <Bar dataKey="Dropout" fill={COLORS.danger} barSize={30} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Urban vs Rural Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Dropout Concentration (Urban vs Rural)</h2>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.region}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.region.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Rural' ? COLORS.rural : COLORS.urban} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for Donut Chart */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
              <span className="text-3xl font-bold text-gray-700">100%</span>
              <span className="block text-xs text-gray-500 mt-1">Total Dropouts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;