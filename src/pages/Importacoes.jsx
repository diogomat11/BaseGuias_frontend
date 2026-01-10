import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Play, Search, Filter } from 'lucide-react';

export default function Importacoes() {
  const [stats, setStats] = useState({ totalContext: 0, processing: 0 });
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username') || 'Usuário';

  // Job Creation State
  const [importType, setImportType] = useState('single'); // single, multiple, all
  const [carteirinhas, setCarteirinhas] = useState([]);
  const [selectedCarteirinhas, setSelectedCarteirinhas] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    created_at_start: '',
    created_at_end: '',
    carteirinha_id: '' // Patient filter
  });

  const fetchGuias = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.created_at_start) params.created_at_start = filters.created_at_start;
      if (filters.created_at_end) params.created_at_end = filters.created_at_end;
      if (filters.carteirinha_id) params.carteirinha_id = filters.carteirinha_id;

      const res = await axios.get('/api/guias', { params });
      setGuias(res.data);
    } catch (error) {
      console.error("Error fetching guias", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarteirinhas = async () => {
    try {
      const res = await axios.get('/api/carteirinhas/?limit=1000'); // Get all for select
      setCarteirinhas(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchGuias();
    fetchCarteirinhas();
  }, []);

  const handleCreateJob = async () => {
    const typeMap = {
      'single': 'single',
      'multiple': 'multiple',
      'all': 'all'
    };

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

      await axios.post('/api/jobs/', payload);
      alert("Jobs criados com sucesso!");
      setSelectedCarteirinhas([]);
    } catch (e) {
      alert("Erro ao criar jobs: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleApplyFilters = () => {
    fetchGuias();
  };

  const handleApplyEnter = (e) => {
    if (e.key === 'Enter') handleApplyFilters();
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.created_at_start) params.created_at_start = filters.created_at_start;
      if (filters.created_at_end) params.created_at_end = filters.created_at_end;
      if (filters.carteirinha_id) params.carteirinha_id = filters.carteirinha_id;

      const response = await axios.get('/api/guias/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'guias_exportadas.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Base Guias Unimed - {username}</h1>

      {/* Job Creation Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3>Nova Solicitação / Importação</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '1rem' }}>

          <div style={{ minWidth: '200px' }}>
            <label>Tipo de Importação</label>
            <select
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#2a2a2a', color: 'white', border: '1px solid #444' }}
              value={importType}
              onChange={e => {
                setImportType(e.target.value);
                setSelectedCarteirinhas([]);
              }}
            >
              <option value="single">Única (Ex: 1 Paciente)</option>
              <option value="multiple">Múltipla (Vários Pacientes)</option>
              <option value="all">Todos (Base Completa)</option>
            </select>
          </div>

          {importType !== 'all' && (
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label>Selecione os Pacientes</label>
              </div>

              {/* Search and Add Component */}
              {importType === 'multiple' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      list="patients-list"
                      placeholder="Pesquisar paciente... (Enter p/ incluir)"
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value;
                          const item = carteirinhas.find(c => (c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha) === val);
                          if (item) {
                            if (!selectedCarteirinhas.includes(item.id)) {
                              setSelectedCarteirinhas([...selectedCarteirinhas, item.id]);
                            }
                            e.target.value = '';
                          }
                        }
                      }}
                      id="patient-search-input"
                    />
                    <datalist id="patients-list">
                      {carteirinhas.map(c => (
                        <option key={c.id} value={c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha} />
                      ))}
                    </datalist>
                    <button className="btn" onClick={() => {
                      const input = document.getElementById('patient-search-input');
                      const val = input.value;
                      const item = carteirinhas.find(c => (c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha) === val);
                      if (item) {
                        if (!selectedCarteirinhas.includes(item.id)) {
                          setSelectedCarteirinhas([...selectedCarteirinhas, item.id]);
                        }
                        input.value = '';
                      } else {
                        alert("Selecione um paciente válido da lista.");
                      }
                    }} style={{ background: '#3b82f6' }}>
                      +
                    </button>
                  </div>

                  {/* Selected List */}
                  <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#222', borderRadius: '4px', padding: '0.5rem' }}>
                    {selectedCarteirinhas.length === 0 && <span style={{ color: '#666', fontSize: '0.9rem' }}>Nenhum paciente selecionado</span>}
                    {selectedCarteirinhas.map(id => {
                      const c = carteirinhas.find(x => x.id === id);
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#333', padding: '0.3rem 0.6rem', marginBottom: '0.3rem', borderRadius: '4px' }}>
                          <span style={{ fontSize: '0.9rem' }}>{c ? (c.paciente || c.carteirinha) : id}</span>
                          <button
                            onClick={() => setSelectedCarteirinhas(selectedCarteirinhas.filter(x => x !== id))}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            x
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Single Selection
                <select
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    background: '#2a2a2a',
                    color: 'white',
                    border: '1px solid #444'
                  }}
                  value={selectedCarteirinhas[0] || ''}
                  onChange={e => setSelectedCarteirinhas([parseInt(e.target.value)])}
                >
                  <option value="">Selecione o Paciente</option>
                  {carteirinhas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.paciente ? `${c.paciente} (${c.carteirinha})` : c.carteirinha}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div style={{ alignSelf: 'center', marginTop: '1.2rem' }}>
            <button className="btn btn-primary" onClick={handleCreateJob} style={{ height: '42px' }}>
              <Play size={16} style={{ display: 'inline', marginRight: 5 }} /> Criar Solicitação
            </button>
          </div>
        </div>
      </div>

      {/* List / Filters Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Listagem de Guias</h3>
        </div>

        {/* Filters Area */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px', flex: 1 }}>
            <label>Paciente / Carteirinha</label>
            <select
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555' }}
              value={filters.carteirinha_id}
              onChange={e => setFilters({ ...filters, carteirinha_id: e.target.value })}
            >
              <option value="">Todos os Pacientes</option>
              {carteirinhas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.paciente ? c.paciente : c.carteirinha}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Data Import. Início</label>
            <input type="date" value={filters.created_at_start} onChange={e => setFilters({ ...filters, created_at_start: e.target.value })} />
          </div>
          <div>
            <label>Data Import. Fim</label>
            <input type="date" value={filters.created_at_end} onChange={e => setFilters({ ...filters, created_at_end: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={handleApplyFilters} style={{ background: '#3b82f6', color: 'white' }}>
              <Filter size={16} style={{ marginRight: 5 }} /> Filtrar
            </button>
            <button className="btn" onClick={handleExport} style={{ background: '#10b981', color: 'white' }}>
              <Download size={16} style={{ marginRight: 5 }} /> Exportar Excel
            </button>
          </div>
        </div>

        {loading ? <p>Carregando...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Data Import</th>
                  <th>Carteira / Paciente</th>
                  <th>Guia</th>
                  <th>Data Autoriz.</th>
                  <th>Senha</th>
                  <th>Validade</th>
                  <th>Terapia</th>
                  <th>Solicitado</th>
                  <th>Autorizado</th>
                </tr>
              </thead>
              <tbody>
                {guias.length > 0 ? guias.map(g => {
                  const paciente = carteirinhas.find(c => c.id === g.carteirinha_id);
                  return (
                    <tr key={g.id}>
                      <td>{new Date(g.created_at).toLocaleDateString()}</td>
                      <td>{paciente ? paciente.paciente || paciente.carteirinha : g.carteirinha_id}</td>
                      <td>{g.guia}</td>
                      <td>{g.data_autorizacao}</td>
                      <td>{g.senha}</td>
                      <td>{g.validade}</td>
                      <td>{g.codigo_terapia}</td>
                      <td>{g.qtde_solicitada}</td>
                      <td>{g.sessoes_autorizadas}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center' }}>Nenhuma guia encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
