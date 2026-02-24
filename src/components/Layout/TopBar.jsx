import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Search,
    Bell,
    Menu,
    User,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

const breadcrumbMap = {
    '/': 'Dashboard',
    '/follow-up': 'Follow Up',
    '/follow-up/prospect': 'Prospect',
    '/follow-up/follow-up': 'Follow Up',
    '/follow-up/schedule-report': 'Schedule Report',
    '/follow-up/view-prospect': 'View Prospect',
    '/follow-up/search-prospect': 'Search by Prospect',
    '/follow-up/register': 'FollowUp Register',
    '/settings': 'Settings',
    '/help': 'Help'
};

const pageTitles = {
    '/': 'Dashboard',
    '/follow-up/prospect': 'New Prospect',
    '/follow-up/follow-up': 'Follow Up Entry',
    '/follow-up/schedule-report': 'Schedule Report',
    '/follow-up/view-prospect': 'View Prospects',
    '/follow-up/search-prospect': 'Search Prospects',
    '/follow-up/register': 'Follow Up Register',
    '/settings': 'Settings',
    '/help': 'Help & Support'
};

export default function TopBar({ onMenuClick }) {
    const location = useLocation();
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Home', path: '/' }];

        let currentPath = '';
        for (const path of paths) {
            currentPath += `/${path}`;
            if (breadcrumbMap[currentPath]) {
                breadcrumbs.push({
                    label: breadcrumbMap[currentPath],
                    path: currentPath
                });
            }
        }

        return breadcrumbs;
    };

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';
    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    <Menu />
                </button>
                <div className="topbar-left-content">
                    <h1 className="topbar-title">{pageTitle}</h1>
                    <nav className="breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.path}>
                                {index > 0 && <span className="breadcrumb-separator">/</span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span>{crumb.label}</span>
                                ) : (
                                    <Link to={crumb.path}>{crumb.label}</Link>
                                )}
                            </span>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="topbar-right">
                <div className="topbar-search">
                    <Search />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button className="topbar-icon-btn">
                    <Bell />
                    <span className="notification-badge" />
                </button>

                <div
                    className="topbar-profile"
                    onClick={() => setShowProfile(!showProfile)}
                    style={{ position: 'relative' }}
                >
                    <div className="topbar-profile-avatar">AS</div>
                    <div className="topbar-profile-info">
                        <div className="topbar-profile-name">Admin Sales</div>
                        <div className="topbar-profile-role">Sales Manager</div>
                    </div>
                    <ChevronDown size={16} />

                    {showProfile && (
                        <div className="profile-dropdown">
                            <button className="dropdown-item">
                                <User />
                                <span>My Profile</span>
                            </button>
                            <button className="dropdown-item">
                                <Settings />
                                <span>Settings</span>
                            </button>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item">
                                <LogOut />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
