import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/logs/');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 'INFO': return '#3b82f6';
      case 'WARN': return '#f59e0b';
      case 'ERROR': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Logs do Sistema</h1>
        <button className="btn" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Atualizar
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Data</th>
              <th style={{ width: '80px' }}>Nível</th>
              <th style={{ width: '200px' }}>Contexto</th>
              <th>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>
                  <span style={{
                    color: getLevelColor(log.level),
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {log.level}
                  </span>
                </td>
                <td>
                  {log.paciente && <div style={{ fontWeight: '500', color: '#fff' }}>{log.paciente}</div>}
                  {log.carteirinha && <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{log.carteirinha}</div>}
                  {!log.carteirinha && <span style={{ color: '#666' }}>-</span>}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#ddd' }}>
                  {log.message}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum log registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
