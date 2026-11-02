import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { printAsPdf } from '../utils/printPdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ReferenceLine
} from 'recharts';

// Dropout rate per group; bars above the overall rate are red, the rest green
const RateBarChart = ({ data, avg, xLabel }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
      <XAxis dataKey="group" tick={{fill: '#6B7280', fontSize: 12}} label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 12 }} />
      <YAxis unit="%" tick={{fill: '#6B7280', fontSize: 12}} />
      <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(v, n, p) => [`${v}% (${p.payload.Total} students)`, 'Dropout Rate']} />
      <ReferenceLine y={avg} stroke="#6B7280" strokeDasharray="4 4" label={{ value: `Avg ${avg}%`, position: 'insideTopRight', fill: '#6B7280', fontSize: 11 }} />
      <Bar dataKey="DropoutRate" barSize={40} radius={[4, 4, 0, 0]}>
        {data.map((d, i) => <Cell key={i} fill={d.DropoutRate > avg ? '#EF4444' : '#10B981'} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

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
      {/* Print-only report header (shown only on the printed PDF) */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview Report</h1>
        <p className="text-sm text-gray-500">Student dropout analytics · Uttar Pradesh</p>
        <hr className="mt-2 border-gray-300" />
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Overview</h1>
          <p className="text-gray-500 mt-1">Real-time analysis based on {kpi.total_students} student records from Uttar Pradesh</p>
        </div>
        <button
          onClick={printAsPdf}
          className="no-print flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition self-start"
        >
          <Printer size={16} /> Print as PDF
        </button>
      </div>
      
      {/* --- KPI CARDS (Real Data) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Students Analyzed</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.total_students.toLocaleString()}</p>
        </div>
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Historical Dropouts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{kpi.total_dropouts.toLocaleString()}</p>
        </div>
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Overall Dropout Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{kpi.dropout_rate}%</p>
        </div>
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 hover:shadow-md transition">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Model Accuracy</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{kpi.accuracy}%</p>
        </div>
      </div>

      {/* --- CHARTS GRID (Real Data) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* 1. District-wise Bar Chart */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
        <div className="print-card print-break-before bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

      {/* --- ATTRIBUTE-WISE ANALYSIS (Real Data) --- */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Attribute-wise Dropout Analysis</h2>
        <p className="text-gray-500 mt-1">Dropout rate within each group. Red bars are above the overall rate of {kpi.dropout_rate}%.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* 5. Attendance */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Attendance vs Dropout Rate</h2>
          <p className="text-xs text-gray-500 mb-4">Below 60% attendance, roughly every second student drops out.</p>
          <div className="h-80">
            <RateBarChart data={charts.attendance} avg={kpi.dropout_rate} xLabel="Attendance (%)" />
          </div>
        </div>

        {/* 6. Distance */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Distance to School vs Dropout Rate</h2>
          <p className="text-xs text-gray-500 mb-4">Dropout risk triples once the school is more than 10 km away.</p>
          <div className="h-80">
            <RateBarChart data={charts.distance} avg={kpi.dropout_rate} xLabel="Distance (km)" />
          </div>
        </div>

        {/* 7. Class 11 marks */}
        <div className="print-card print-break-before bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Class 11 Marks vs Dropout Rate</h2>
          <p className="text-xs text-gray-500 mb-4">Students scoring below 45% are about twice as likely to drop out.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.marks} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="group" tick={{fill: '#6B7280', fontSize: 12}} label={{ value: 'Class 11 Percentage', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 12 }} />
                <YAxis unit="%" tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.Total} students)`, 'Dropout Rate']} />
                <ReferenceLine y={kpi.dropout_rate} stroke="#6B7280" strokeDasharray="4 4" label={{ value: `Avg ${kpi.dropout_rate}%`, position: 'insideTopRight', fill: '#6B7280', fontSize: 11 }} />
                <Line type="monotone" dataKey="DropoutRate" stroke={COLORS.urban} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Siblings */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Number of Siblings vs Dropout Rate</h2>
          <p className="text-xs text-gray-500 mb-4">Families with 3 or more children see a sharp jump in dropouts.</p>
          <div className="h-80">
            <RateBarChart data={charts.siblings} avg={kpi.dropout_rate} xLabel="Number of Siblings" />
          </div>
        </div>

        {/* 9. Parents' education */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Parents' Education vs Dropout Rate</h2>
          <p className="text-xs text-gray-500 mb-4">Risk is highest when a parent is illiterate; beyond 10th pass it levels off.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.parent_education} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="education" tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis unit="%" tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <ReferenceLine y={kpi.dropout_rate} stroke="#6B7280" strokeDasharray="4 4" />
                <Bar dataKey="Father" fill={COLORS.urban} barSize={28} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mother" fill={COLORS.rural} barSize={28} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10. Which attributes matter */}
        <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Which Attributes Matter Most?</h2>
          <p className="text-xs text-gray-500 mb-4">Gap between the highest- and lowest-risk group of each attribute, in percentage points.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.attribute_gap} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" unit=" pts" tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis dataKey="attribute" type="category" tick={{fill: '#6B7280', fontSize: 11}} width={190} interval={0} />
                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(v) => [`${v} percentage points`, 'Gap']} />
                <Bar dataKey="Gap" fill="#6366F1" barSize={14} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;