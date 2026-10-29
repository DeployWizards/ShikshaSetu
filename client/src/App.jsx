import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import CityAnalytics from './pages/CityAnalytics'; // Import new page
import BulkUpload from './pages/BulkUpload';
import MLReports from './pages/MLReports';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<Prediction />} />
          <Route path="city-analytics" element={<CityAnalytics />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="ml-reports" element={<MLReports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;