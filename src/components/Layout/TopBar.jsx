import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Search,
    Bell,
    Menu,
    User,
    Settings,
    LogOut,
    ChevronDown,
    X,
    Wrench,
    Calendar
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
    '/sales': 'Sales',
    '/sales/quotation': 'Quotation',
    '/sales/delivered-vehicles': 'Delivered Vehicles',
    '/sales/invoice': 'Invoice',
    '/sales/delivery': 'Delivery Challan',
    '/sales/receipt': 'Payment Receipt',
    '/sales/report': 'Sales Report',
    '/service': 'Service',
    '/service/all': 'All Services',
    '/service/today': 'Due Today',
    '/service/upcoming': 'Upcoming Services',
    '/service/report': 'Service Report',
    '/masters': 'Masters',
    '/masters/staff': 'Staff Master',
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
    '/sales/quotation': 'Quotation',
    '/sales/delivered-vehicles': 'Delivered Vehicles',
    '/sales/invoice': 'Invoice',
    '/sales/delivery': 'Delivery Challan',
    '/sales/receipt': 'Payment Receipt',
    '/sales/report': 'Sales Report',
    '/service/all': 'Service Management',
    '/service/today': "Today's Services",
    '/service/upcoming': 'Upcoming Services',
    '/service/report': 'Service Report',
    '/masters/staff': 'Staff Master',
    '/settings': 'Settings',
    '/help': 'Help & Support'
};

export default function TopBar({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser, logout } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [todayServices, setTodayServices] = useState([]);
    const [todayCount, setTodayCount] = useState(0);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load today's service count
    useEffect(() => {
        loadTodayServices();
        const interval = setInterval(loadTodayServices, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadTodayServices = async () => {
        try {
            const countResult = await api.getTodayServicesCount();
            setTodayCount(countResult.count || 0);
        } catch (error) {
            // Silently fail
        }
    };

    const loadTodayServiceDetails = async () => {
        try {
            const services = await api.getTodayServices();
            setTodayServices(services || []);
        } catch (error) {
            setTodayServices([]);
        }
    };

    const handleBellClick = () => {
        if (!showNotifications) {
            loadTodayServiceDetails();
        }
        setShowNotifications(!showNotifications);
        setShowProfile(false);
    };

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

    const handleLogout = () => {
        setShowProfile(false);
        logout();
        navigate('/login', { replace: true });
    };

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';
    const breadcrumbs = getBreadcrumbs();
    const userInitials = adminUser?.name
        ? adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'AS';

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

                {/* Bell Notification Icon */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button className="topbar-icon-btn" onClick={handleBellClick}>
                        <Bell />
                        {todayCount > 0 && (
                            <span className="notification-badge notification-badge-count">{todayCount}</span>
                        )}
                    </button>

                    {/* Notification Popup */}
                    {showNotifications && (
                        <div className="notification-popup">
                            <div className="notification-popup-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Wrench size={16} style={{ color: 'var(--color-primary)' }} />
                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Today's Vehicle Services</span>
                                </div>
                                <button
                                    className="notification-popup-close"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="notification-popup-body">
                                {todayServices.length === 0 ? (
                                    <div className="notification-empty">
                                        <Calendar size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                                        <div style={{ fontWeight: 500 }}>No services due today</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>All clear for now!</div>
                                    </div>
                                ) : (
                                    todayServices.map(service => (
                                        <div key={service.id} className="notification-item">
                                            <div className="notification-item-icon">
                                                <Wrench size={14} />
                                            </div>
                                            <div className="notification-item-content">
                                                <div className="notification-item-title">{service.customer_name}</div>
                                                <div className="notification-item-detail">
                                                    {service.vehicle_model && <span>{service.vehicle_model} • </span>}
                                                    <span>{service.customer_mobile}</span>
                                                </div>
                                                <div className="notification-item-badge">
                                                    {service.service_month} Service
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {todayServices.length > 0 && (
                                <div className="notification-popup-footer">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(false);
                                            navigate('/service/today');
                                        }}
                                    >
                                        View All Services →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div
                    className="topbar-profile"
                    ref={dropdownRef}
                    onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                    style={{ position: 'relative' }}
                >
                    <div className="topbar-profile-avatar">{userInitials}</div>
                    <div className="topbar-profile-info">
                        <div className="topbar-profile-name">{adminUser?.name || 'Admin Sales'}</div>
                        <div className="topbar-profile-role">{adminUser?.role || 'Sales Manager'}</div>
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
                            <button className="dropdown-item logout-item" onClick={handleLogout}>
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
