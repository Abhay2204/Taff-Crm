import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="main-layout">
            {/* Company Header - Full Width */}
            <div className="company-header">
                <div className="company-header-content">
                    <h1 className="company-name">CHANDRAPUR MOTORS & TRACTORS</h1>
                    <span className="company-badge">TAFE :25-26</span>
                </div>
            </div>

            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            <div className="main-content">
                <TopBar onMenuClick={toggleSidebar} />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
