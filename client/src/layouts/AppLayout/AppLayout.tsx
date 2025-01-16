import { Outlet } from 'react-router-dom';
import './AppLayout.css';
import Header from '../Header/Header';
import Sidebar from '../../widgets/Sidebar/Sidebar';

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-content">
        <Sidebar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
