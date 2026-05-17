import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const CATEGORIES = [
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'personal', label: 'Personal', icon: '🏡' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'ideas', label: 'Ideas', icon: '💡' },
  { id: 'meetings', label: 'Meetings', icon: '🤝' },
];

const NavItem = ({ to, icon, label, end, badge }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
    {badge != null && <span className="nav-badge">{badge}</span>}
  </NavLink>
);

export default function Sidebar({ noteCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <motion.div className="sidebar-logo-mark" whileHover={{ rotate: 6, scale: 1.06 }} whileTap={{ scale: 0.95 }}>
          <span>P</span>
        </motion.div>
        <div>
          <div className="sidebar-logo-text">peblo</div>
          <div className="sidebar-logo-sub">workspace</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">Main</div>
        <NavItem to="/" end icon="📝" label="All Notes" badge={noteCount} />
        <NavItem to="/dashboard" icon="📊" label="Dashboard" />
        <NavItem to="/archive" icon="📦" label="Archive" />

        <div className="nav-group-label" style={{ marginTop: 20 }}>Categories</div>
        {CATEGORIES.map(c => (
          <NavLink
            key={c.id}
            to={`/?category=${c.id}`}
            className="nav-item"
          >
            <span className="nav-icon">{c.icon}</span>
            <span className="nav-label">{c.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email truncate">{user?.email}</div>
          </div>
          <button className="btn-ghost btn-icon btn-sm logout-btn" onClick={logout} title="Sign out">
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}
