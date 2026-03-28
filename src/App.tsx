import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Battle from './pages/Battle';
import Leaderboard from './pages/Leaderboard';
import SideBySide from './pages/SideBySide';
import { useStore } from './store/useStore';
import { Sword, Trophy, Layout, Home as HomeIcon } from 'lucide-react';
import clsx from 'clsx';

function Sidebar() {
  const location = useLocation();
  const { mode, setMode } = useStore();

  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon size={20} /> },
    { name: 'Battle', path: '/battle', icon: <Sword size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Side by Side', path: '/side-by-side', icon: <Layout size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="logo">
          <div className="logo-icon"><Sword size={18} color="white" /></div>
          <span>Arena</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-label">Main</div>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={clsx('nav-item', location.pathname === link.path && 'active')}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">JD</div>
          <div className="details">
            <div className="name">Guest User</div>
            <div className="status">Online</div>
          </div>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--f-display);
          font-weight: 600;
          font-size: 1.5rem;
          color: var(--ink);
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-nav {
          flex: 1;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nav-label {
          padding: 0 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-muted);
          margin-bottom: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--ink-muted);
          font-weight: 500;
          font-size: 14px;
          transition: var(--transition);
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          background: var(--surface-hover);
          color: var(--ink);
        }
        .nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
        }
        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background: var(--accent-soft);
          color: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
        }
        .details .name {
          font-size: 14px;
          font-weight: 600;
        }
        .details .status {
          font-size: 11px;
          color: var(--success);
        }
      `}</style>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/side-by-side" element={<SideBySide />} />
          </Routes>
        </main>
      </div>
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 40px;
          background: var(--bg);
        }
      `}</style>
    </Router>
  );
}
