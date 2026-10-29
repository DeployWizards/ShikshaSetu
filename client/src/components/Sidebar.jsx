import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileBarChart, Settings, FileText, Activity } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Predict Dropout', icon: <Users size={20} />, path: '/predict' },
    { name: 'City Insights', icon: <FileBarChart size={20} />, path: '/city-analytics' },
    { name: 'Bulk Upload', icon: <FileText size={20} />, path: '/bulk-upload' },
    { name: 'ML Reports', icon: <Activity size={20} />, path: '/ml-reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '#' },
  ];

  return (
    <div className="h-screen w-64 bg-blue-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold tracking-wider">ShikshaSetu</h1>
        <p className="text-blue-300 text-xs mt-1">AI Prediction System</p>
      </div>

      <div className="flex-1 py-6">
        <nav className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.path !== '#' && isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-blue-800 text-sm text-blue-400 text-center">
        © 2024 ShikshaSetu
      </div>
    </div>
  );
};

export default Sidebar;