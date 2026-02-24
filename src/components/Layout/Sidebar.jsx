import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  Search,
  ClipboardList,
  ChevronRight,
  Building2,
  UserCog,
  Database,
  TrendingUp,
  Truck,
  Receipt,
  IndianRupee,
  BarChart3,
  Wrench,
  Bell,
  Clock,
  Tractor,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';
import store from '../../services/store';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  {
    title: 'Follow Up',
    icon: Users,
    children: [
      { title: 'Add Prospect', path: '/follow-up/prospect', icon: UserPlus },
      { title: 'Follow Up', path: '/follow-up/follow-up', icon: Calendar },
      { title: 'Schedule Report', path: '/follow-up/schedule-report', icon: FileText },
      { title: 'View Prospects', path: '/follow-up/view-prospect', icon: Users },
      { title: 'Search Prospect', path: '/follow-up/search-prospect', icon: Search },
      { title: 'Follow Up Register', path: '/follow-up/register', icon: ClipboardList },
    ]
  },
  {
    title: 'Sales',
    icon: TrendingUp,
    children: [
      { title: 'Quotation', path: '/sales/quotation', icon: FileText },
      { title: 'Invoice', path: '/sales/invoice', icon: Receipt },
      { title: 'Delivery Challan', path: '/sales/delivery', icon: Truck },
      { title: 'Delivered Vehicles', path: '/sales/delivered-vehicles', icon: FileCheck },
      { title: 'Payment Receipt', path: '/sales/receipt', icon: IndianRupee },
      { title: 'Sales Report', path: '/sales/report', icon: BarChart3 },
    ]
  },
  {
    title: 'Service',
    icon: Wrench,
    hasBadge: true,
    children: [
      { title: 'All Services', path: '/service/all', icon: Wrench },
      { title: 'Due Today', path: '/service/today', icon: Bell },
      { title: 'Upcoming', path: '/service/upcoming', icon: Clock },
      { title: 'Service Report', path: '/service/report', icon: BarChart3 },
    ]
  },
  {
    title: 'Masters',
    icon: Database,
    children: [
      { title: 'Vehicle Master', path: '/masters/vehicle', icon: Tractor },
      { title: 'Staff Master', path: '/masters/staff', icon: UserCog },
    ]
  },
];

function NavItem({ item, isOpen, onToggle, badgeCount }) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = hasChildren
    ? item.children.some(child => location.pathname === child.path)
    : location.pathname === item.path;
  const isExpanded = isOpen || isActive;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div className="nav-item">
        <button
          className={`nav-link ${isActive ? 'active' : ''}`}
          onClick={onToggle}
        >
          <Icon />
          <span className="nav-link-text">{item.title}</span>
          {item.hasBadge && badgeCount > 0 && (
            <span className="nav-badge">{badgeCount}</span>
          )}
          <ChevronRight className={`nav-arrow ${isExpanded ? 'expanded' : ''}`} />
        </button>
        <div className={`nav-submenu ${isExpanded ? 'expanded' : ''}`}>
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <child.icon />
              <span className="nav-link-text">{child.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="nav-item">
      <NavLink
        to={item.path}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        <Icon />
        <span className="nav-link-text">{item.title}</span>
      </NavLink>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const [expandedItems, setExpandedItems] = useState(['Follow Up']);
  const [todayServiceCount, setTodayServiceCount] = useState(0);

  useEffect(() => {
    const loadCount = () => setTodayServiceCount(store.getTodayServices().length);
    loadCount();
    const interval = setInterval(loadCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleItem = (title) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 />
            <span>Chandrapur Motors</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {menuItems.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isOpen={expandedItems.includes(item.title)}
                onToggle={() => toggleItem(item.title)}
                badgeCount={item.hasBadge ? todayServiceCount : 0}
              />
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">AS</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Admin</div>
              <div className="sidebar-user-role">Sales Manager</div>
            </div>
          </div>
          <div style={{
            marginTop: 'var(--spacing-md)',
            paddingTop: 'var(--spacing-sm)',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              Designed by
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Back2Source Software Solutions
            </div>
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              8421822204
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
