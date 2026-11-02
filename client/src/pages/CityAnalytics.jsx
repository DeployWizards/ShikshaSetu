import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { printAsPdf } from '../utils/printPdf';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ReferenceLine
} from 'recharts';

// Shared palette (kept identical to the Dashboard so both pages read as one system)
const COLORS = {
  safe: '#10B981',   // Emerald Green
  danger: '#EF4444', // Red
  urban: '#3B82F6',  // Blue
  rural: '#F59E0B',  // Amber/Orange
};

// Dropout rate per group; bars above the city's overall rate are red, the rest green
const RateBarChart = ({ data, avg, xLabel }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
      <XAxis dataKey="group" tick={{ fill: '#6B7280', fontSize: 12 }} label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 12 }} />
      <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} />
      <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(v, n, p) => [`${v}% (${p.payload.Total} students)`, 'Dropout Rate']} />
      <ReferenceLine y={avg} stroke="#6B7280" strokeDasharray="4 4" label={{ value: `Avg ${avg}%`, position: 'insideTopRight', fill: '#6B7280', fontSize: 11 }} />
      <Bar dataKey="DropoutRate" barSize={40} radius={[4, 4, 0, 0]}>
        {data.map((d, i) => <Cell key={i} fill={d.DropoutRate > avg ? COLORS.danger : COLORS.safe} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const CityAnalytics = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const charts = cityData?.charts;
  const overview = cityData?.overview;

  return (
    <div className="w-full pb-10">

      {/* Header and Dropdown Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 print:hidden bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">City Insights</h1>
          <p className="text-gray-500 mt-1">
            Deep dive into local dropout metrics
            {selectedCity ? ` — ${selectedCity}` : ''}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-end gap-3 w-full md:w-auto">
          <div className="w-full md:w-72 no-print">
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
          <button
            onClick={printAsPdf}
            disabled={!cityData || !!cityData?.error}
            className="no-print flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} /> Print as PDF
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 font-bold animate-pulse">Loading data for {selectedCity}...</p>}

      {!loading && cityData && !cityData.error && (
        <>
          {/* Print-only report header (shown only on the printed PDF) */}
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold text-gray-900">City Insights Report — {selectedCity}</h1>
            <p className="text-sm text-gray-500">Student dropout analytics · Uttar Pradesh</p>
            <hr className="mt-2 border-gray-300" />
          </div>

          {/* --- KPI CARDS for the City --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Students</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{overview.total_students.toLocaleString()}</p>
            </div>
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Dropouts</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{overview.total_dropouts.toLocaleString()}</p>
            </div>
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Dropout Rate</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{overview.dropout_rate}%</p>
            </div>
          </div>

          {/* --- CHARTS GRID (same style as the main Dashboard) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* 1. Gender */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Gender Distribution (Safe vs Dropout)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.gender} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="gender" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="Safe" stackId="a" fill={COLORS.safe} radius={[0, 0, 4, 4]} barSize={50} />
                    <Bar dataKey="Dropout" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Region (Urban vs Rural) */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Area Context (Urban vs Rural)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.region} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="region" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="Safe" stackId="a" fill={COLORS.urban} radius={[0, 0, 4, 4]} barSize={50} />
                    <Bar dataKey="Dropout" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Income */}
            <div className="print-card print-break-before bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Impact of Family Income on Dropout Rate</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.income} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="cityIncomeRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="income" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Area type="monotone" dataKey="DropoutRate" name="Dropout Rate (%)" stroke={COLORS.danger} fillOpacity={1} fill="url(#cityIncomeRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Dropout concentration (Urban vs Rural donut) */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Dropout Concentration (Urban vs Rural)</h2>
              <div className="h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.region_share}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.region_share.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Rural' ? COLORS.rural : COLORS.urban} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                  <span className="text-3xl font-bold text-gray-700">100%</span>
                  <span className="block text-xs text-gray-500 mt-1">Total Dropouts</span>
                </div>
              </div>
            </div>

          </div>

          {/* --- ATTRIBUTE-WISE ANALYSIS (city-scoped, same as Dashboard) --- */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Attribute-wise Dropout Analysis</h2>
            <p className="text-gray-500 mt-1">
              Dropout rate within each group for {selectedCity}. Red bars are above the city's overall rate of {overview.dropout_rate}%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* 5. Attendance */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-1">Attendance vs Dropout Rate</h2>
              <p className="text-xs text-gray-500 mb-4">Lower attendance bands usually show the sharpest rise in dropouts.</p>
              <div className="h-80">
                <RateBarChart data={charts.attendance} avg={overview.dropout_rate} xLabel="Attendance (%)" />
              </div>
            </div>

            {/* 6. Distance */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-1">Distance to School vs Dropout Rate</h2>
              <p className="text-xs text-gray-500 mb-4">Dropout risk tends to climb as the school gets farther away.</p>
              <div className="h-80">
                <RateBarChart data={charts.distance} avg={overview.dropout_rate} xLabel="Distance (km)" />
              </div>
            </div>

            {/* 7. Class 11 marks */}
            <div className="print-card print-break-before bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-1">Class 11 Marks vs Dropout Rate</h2>
              <p className="text-xs text-gray-500 mb-4">Weaker academic performance is a strong signal of dropout risk.</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.marks} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="group" tick={{ fill: '#6B7280', fontSize: 12 }} label={{ value: 'Class 11 Percentage', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.Total} students)`, 'Dropout Rate']} />
                    <ReferenceLine y={overview.dropout_rate} stroke="#6B7280" strokeDasharray="4 4" label={{ value: `Avg ${overview.dropout_rate}%`, position: 'insideTopRight', fill: '#6B7280', fontSize: 11 }} />
                    <Line type="monotone" dataKey="DropoutRate" stroke={COLORS.urban} strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 8. Siblings */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-1">Number of Siblings vs Dropout Rate</h2>
              <p className="text-xs text-gray-500 mb-4">Larger families often face higher dropout pressure.</p>
              <div className="h-80">
                <RateBarChart data={charts.siblings} avg={overview.dropout_rate} xLabel="Number of Siblings" />
              </div>
            </div>

            {/* 9. Parents' education */}
            <div className="print-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-700 mb-1">Parents' Education vs Dropout Rate</h2>
              <p className="text-xs text-gray-500 mb-4">Risk is usually highest when a parent is illiterate and eases with more schooling.</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.parent_education} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="education" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis unit="%" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(v) => `${v}%`} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <ReferenceLine y={overview.dropout_rate} stroke="#6B7280" strokeDasharray="4 4" />
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
                    <XAxis type="number" unit=" pts" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis dataKey="attribute" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={190} interval={0} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(v) => [`${v} percentage points`, 'Gap']} />
                    <Bar dataKey="Gap" fill="#6366F1" barSize={14} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

      {!loading && cityData && cityData.error && (
        <div className="text-center text-red-500 font-bold mt-10">
          {cityData.error}. Please ensure the FastAPI server is running.
        </div>
      )}
    </div>
  );
};

export default CityAnalytics;
