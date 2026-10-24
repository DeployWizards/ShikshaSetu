import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      {/* Main Content Area - margin-left (ml-64) because sidebar is fixed with width 64 (16rem) */}
      <div className="flex-1 ml-64 p-8">
        <Outlet /> 
      </div>
    </div>
  );
};

export default Layout;