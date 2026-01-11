import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Play, Filter, RefreshCcw, Trash2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function Importacoes() {
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'Usuário';

  // Job Creation State
  const [importType, setImportType] = useState('single');
  const [carteirinhas, setCarteirinhas] = useState([]);
  const [selectedCarteirinhas, setSelectedCarteirinhas] = useState([]);

  // Jobs List State
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    created_at_start: '',
    created_at_end: ''
  });

  useEffect(() => {
    fetchCarteirinhas();
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [page, pageSize, filters]);

  const fetchCarteirinhas = async () => {
    try {
      const res = await api.get('/carteirinhas/?limit=1000');
      setCarteirinhas(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  const fetchJobs = async () => {
    // Don't set loading true on polling to avoid flickering, only first load?
    // For now, simple.
    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
        ...filters
      };
      const res = await api.get('/jobs', { params });
      if (res.data.data) {
        setJobs(res.data.data);
        setTotalJobs(res.data.total);
      } else {
        setJobs(res.data);
      }
    } catch (e) { console.error("Error fetching jobs", e); }
  };

  const handleCreateJob = async () => {
    const typeMap = { 'single': 'single', 'multiple': 'multiple', 'all': 'all' };

    if ((importType === 'single' || importType === 'multiple') && selectedCarteirinhas.length === 0) {
      alert("Selecione pelo menos uma carteirinha/paciente.");
      return;
    }

    if (importType === 'all' && !confirm("Deseja processar TODAS as carteirinhas?")) return;

    try {
      const payload = {
        type: typeMap[importType],
        carteirinha_ids: (importType === 'all') ? [] : selectedCarteirinhas
      };

      await api.post('/jobs/', payload);
      alert("Solicitações criadas com sucesso!");
      setSelectedCarteirinhas([]);
      fetchJobs();
    } catch (e) {
      alert("Erro ao criar jobs: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este Job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (e) {
      alert("Erro ao excluir: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleRetryJob = async (id) => {
    if (!confirm("Deseja reenviar este Job?")) return;
    try {
      await api.post(`/jobs/${id}/retry`);
      fetchJobs();
    } catch (e) {
      alert("Erro ao reenviar: " + (e.response?.data?.detail || e.message));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={18} color="#10b981" />;
      case 'error': return <AlertCircle size={18} color="#ef4444" />;
      case 'pending': return <Clock size={18} color="#f59e0b" />;
      case 'processing': return <RefreshCcw size={18} className="spin" color="#3b82f6" />;
      default: return null;
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const diff = new Date(end) - new Date(start);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Importações / Jobs - {username}</h1>

      {/* Creation Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>Nova Solicitação</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '1rem' }}>
          {/* Same select logic as before, simplified for this snippet */}
          <div style={{ minWidth: '200px' }}>
            <label>Tipo</label>
            <select
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2a2a2a', color: 'white', border: '1px solid #444' }}
              value={importType}
              onChange={e => { setImportType(e.target.value); setSelectedCarteirinhas([]); }}
            >
              <option value="single">Única</option>
              <option value="multiple">Múltipla</option>
              <option value="all">Todos</option>
            </select>
          </div>

          {importType !== 'all' && (
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label>Pacientes</label>
              {/* Reusing the multiple select logic from before would take space, keeping it simple: Select multiple IDs via standard select for now or reuse the component logic */}
              <select
                style={{ width: '100%', padding: '0.6rem', background: '#2a2a2a', color: 'white', border: '1px solid #444', height: '100px' }}
                multiple
                value={selectedCarteirinhas.map(String)}
                onChange={e => {
                  const options = [...e.target.selectedOptions];
                  const values = options.map(o => parseInt(o.value));
                  setSelectedCarteirinhas(values);
                }}
              >
                {carteirinhas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha}
                  </option>
                ))}
              </select>
              <small style={{ color: '#888' }}>Segure Ctrl para selecionar múltiplos</small>
            </div>
          )}

          <div style={{ alignSelf: 'center' }}>
            <button className="btn btn-primary" onClick={handleCreateJob} style={{ height: '42px' }}>
              <Play size={16} style={{ display: 'inline', marginRight: 5 }} /> Criar Solicitação
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              style={{ padding: '0.4rem', borderRadius: '4px', background: '#333', color: 'white' }}
            >
              <option value="">Todos</option>
              <option value="success">Sucesso</option>
              <option value="error">Erro</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
            </select>
          </div>
          <div>
            <label>Data Início</label>
            <input type="date" value={filters.created_at_start} onChange={e => setFilters({ ...filters, created_at_start: e.target.value })} />
          </div>
          <div>
            <label>Data Fim</label>
            <input type="date" value={filters.created_at_end} onChange={e => setFilters({ ...filters, created_at_end: e.target.value })} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data Criação</th>
                <th>Status</th>
                <th>Tentativas</th>
                <th>Tempo Proc.</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{new Date(job.created_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {getStatusIcon(job.status)} {job.status}
                    </div>
                  </td>
                  <td>{job.attempts}</td>
                  <td>{calculateDuration(job.created_at, job.updated_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Delete/Retry allowed only if error and attempts > 3 */}
                      {(job.status === 'error' && job.attempts > 3) ? (
                        <>
                          <button className="btn" style={{ padding: '0.3rem', background: '#f59e0b' }} onClick={() => handleRetryJob(job.id)} title="Reenviar">
                            <RefreshCcw size={14} />
                          </button>
                          <button className="btn" style={{ padding: '0.3rem', background: '#ef4444' }} onClick={() => handleDeleteJob(job.id)} title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum job encontrado.</td></tr>}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalItems={totalJobs}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
