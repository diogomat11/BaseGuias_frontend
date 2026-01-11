import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Pagination from '../components/Pagination';
import { Download, Filter, X } from 'lucide-react';

export default function BaseGuias() {
    const [guias, setGuias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [carteirinhas, setCarteirinhas] = useState([]);

    const username = localStorage.getItem('username') || 'Usuário';

    const [filters, setFilters] = useState({
        created_at_start: '',
        created_at_end: '',
        carteirinha_id: ''
    });

    // Fetch Carteirinhas for select
    useEffect(() => {
        api.get('/carteirinhas/?limit=1000').then(res => {
            setCarteirinhas(res.data.data || res.data);
        }).catch(console.error);
    }, []);

    // Fetch Guias with effect on dependencies
    useEffect(() => {
        fetchGuias();
    }, [page, pageSize, filters]); // Auto-filter when these change

    const fetchGuias = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pageSize,
                skip: (page - 1) * pageSize,
                ...filters
            };

            const res = await api.get('/guias', { params });
            // Backend now returns { data: [], total: N, ... }
            if (res.data.data) {
                setGuias(res.data.data);
                setTotalItems(res.data.total);
            } else {
                // Fallback if backend not updated yet (shouldn't happen if deployed)
                setGuias(res.data);
                setTotalItems(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching guias", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            created_at_start: '',
            created_at_end: '',
            carteirinha_id: ''
        });
        setPage(1);
    };

    const handleExport = async () => {
        try {
            const params = { ...filters };
            const response = await api.get('/guias/export', {
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
            alert("Erro ao exportar");
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Base Guias Unimed - {username}</h1>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Listagem de Guias</h3>
                </div>

                {/* Filters */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '200px', flex: 1 }}>
                        <label>Paciente / Carteirinha</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555' }}
                            value={filters.carteirinha_id}
                            onChange={e => {
                                setFilters({ ...filters, carteirinha_id: e.target.value });
                                setPage(1); // Reset page on filter
                            }}
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
                        <input
                            type="date"
                            value={filters.created_at_start}
                            onChange={e => {
                                setFilters({ ...filters, created_at_start: e.target.value });
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label>Data Import. Fim</label>
                        <input
                            type="date"
                            value={filters.created_at_end}
                            onChange={e => {
                                setFilters({ ...filters, created_at_end: e.target.value });
                                setPage(1);
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" onClick={handleClearFilters} style={{ background: '#4b5563', color: 'white' }} title="Limpar Filtros">
                            <X size={16} style={{ marginRight: 5 }} /> Limpar
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

                <Pagination
                    currentPage={page}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>
        </div>
    );
}
