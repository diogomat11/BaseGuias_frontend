import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Activity, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import Importacoes from './pages/Importacoes';
import Carteirinhas from './pages/Carteirinhas';
import Logs from './pages/Logs';
import Login from './pages/Login';

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
          <LayoutDashboard size={20} /> Importações
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

function PrivateLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Auto-logout Logic
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
      }, INACTIVITY_TIMEOUT);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Start timer

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateLayout>
            <Importacoes />
          </PrivateLayout>
        } />
        <Route path="/carteirinhas" element={
          <PrivateLayout>
            <Carteirinhas />
          </PrivateLayout>
        } />
        <Route path="/logs" element={
          <PrivateLayout>
            <Logs />
          </PrivateLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
