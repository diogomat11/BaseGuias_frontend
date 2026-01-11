import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Activity, LogOut, Table } from 'lucide-react';
import React, { useEffect } from 'react';
import Importacoes from './pages/Importacoes'; // Now Jobs
import Carteirinhas from './pages/Carteirinhas';
import Logs from './pages/Logs';
import Login from './pages/Login';
import BaseGuias from './pages/BaseGuias';
import Dashboard from './pages/Dashboard';

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const username = localStorage.getItem('username') || 'Usuário';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="brand">Base Guias Unimed <br /><small className="text-xs text-slate-400">By Baldurrok</small></div>
      <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
        Olá, {username}
      </div>
      <nav style={{ flex: 1 }}>
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/guias" className={`nav-item ${isActive('/guias')}`}>
          <Table size={20} /> Base Guias
        </Link>
        <Link to="/jobs" className={`nav-item ${isActive('/jobs')}`}>
          {/* Using Import icon for Jobs */}
          <FileText size={20} /> Importações
        </Link>
        <Link to="/carteirinhas" className={`nav-item ${isActive('/carteirinhas')}`}>
          <Users size={20} /> Carteirinhas
        </Link>
        <Link to="/logs" className={`nav-item ${isActive('/logs')}`}>
          <Activity size={20} /> Logs
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full">
          <LogOut size={16} /> Sair
        </button>
      </div>
      <div className="footer-brand text-center py-4">
        <div className="text-xs text-slate-600">Developed by</div>
        <div className="font-bold text-slate-500">BALDURROK</div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Dashboard />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/guias" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <BaseGuias />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/jobs" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Importacoes />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/carteirinhas" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Carteirinhas />
              </main>
            </div>
          </PrivateRoute>
        } />

        <Route path="/logs" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Logs />
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
