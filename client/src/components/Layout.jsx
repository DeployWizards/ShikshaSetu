import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="print-shell flex bg-gray-100 min-h-screen">
      <div className="no-print">
        <Sidebar />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8 print-root">
        <Outlet /> 
      </div>
    </div>
  );
};

export default Layout;
