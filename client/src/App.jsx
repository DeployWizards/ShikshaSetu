import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import CityAnalytics from './pages/CityAnalytics'; // Import new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<Prediction />} />
          <Route path="city-analytics" element={<CityAnalytics />} /> {/* New Route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;