import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Upload, Plus, Edit, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import EditCarteirinhaModal from '../components/EditCarteirinhaModal';

export default function Carteirinhas() {
    const [carteirinhas, setCarteirinhas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [overwrite, setOverwrite] = useState(false);

    // Pagination & Search state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const limit = 10;

    // Edit state
    const [editingItem, setEditingItem] = useState(null);

    const fetchCarteirinhas = async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const params = { skip, limit };
            if (search) params.search = search;

            const res = await axios.get('/api/carteirinhas/', { params });
            // Backend now returns { data, total, skip, limit }
            setCarteirinhas(res.data.data || res.data); // Fallback if backend not updated instantly often cache issues
            if (res.data.total !== undefined) {
                setTotalItems(res.data.total);
                setTotalPages(Math.ceil(res.data.total / limit));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCarteirinhas();
    }, [page, search]); // Re-fetch on page or search change

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('overwrite', overwrite);

        try {
            setLoading(true);
            await axios.post('/api/carteirinhas/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Upload realizado com sucesso!");
            setFile(null);
            setPage(1); // Reset to first page
            fetchCarteirinhas();
        } catch (e) {
            alert("Erro no upload: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Excluir carteirinha?")) return;
        try {
            await axios.delete(`/api/carteirinhas/${id}`);
            fetchCarteirinhas();
        } catch (e) { alert("Erro ao excluir"); }
    };

    return (
        <div>
            <h1>Gerenciamento de Carteirinhas</h1>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Upload em Lote (Excel/CSV)</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={e => setFile(e.target.files[0])} />
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} style={{ width: 'auto' }} />
                        Sobrescrever tudo?
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Upload size={16} style={{ marginRight: 5 }} /> Importar
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Carteirinhas Cadastradas ({totalItems})</h3>

                    <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={18} style={{ position: 'absolute', left: 10, color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{ paddingLeft: '35px', maxWidth: '250px' }}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>ID</th>
                                <th>Carteirinha</th>
                                <th>Paciente</th>
                                <th style={{ width: '100px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carteirinhas.map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.carteirinha}</td>
                                    <td>{c.paciente}</td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" onClick={() => setEditingItem(c)} title="Editar">
                                            <Edit size={16} color="#3b82f6" />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(c.id)} title="Excluir">
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {carteirinhas.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>Nenhum registro encontrado</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <span>Página {page} de {totalPages || 1}</span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button
                            className="btn"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            style={{ padding: '0.5rem' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditCarteirinhaModal
                    carteirinha={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={fetchCarteirinhas}
                />
            )}
        </div>
    );
}
