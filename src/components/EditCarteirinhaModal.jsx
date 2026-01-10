import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

export default function EditCarteirinhaModal({ carteirinha, onClose, onSave }) {
    const [formData, setFormData] = useState({
        carteirinha: '',
        paciente: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (carteirinha) {
            setFormData({
                carteirinha: carteirinha.carteirinha,
                paciente: carteirinha.paciente
            });
        }
    }, [carteirinha]);

    const validateFormat = (code) => {
        if (code.length !== 21) return false;
        if (code[4] !== '.' || code[9] !== '.' || code[16] !== '.' || code[19] !== '-') return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFormat(formData.carteirinha)) {
            alert("Carteirinha inválida! Deve conter 21 caracteres, ex: 0064.8000.400948.00-5");
            return;
        }

        setLoading(true);
        try {
            await axios.put(`/api/carteirinhas/${carteirinha.id}`, formData);
            onSave();
            onClose();
        } catch (error) {
            alert("Erro ao salvar: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!carteirinha) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Editar Carteirinha</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Carteirinha</label>
                        <input
                            type="text"
                            value={formData.carteirinha}
                            onChange={e => setFormData({ ...formData, carteirinha: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label>Paciente</label>
                        <input
                            type="text"
                            value={formData.paciente}
                            onChange={e => setFormData({ ...formData, paciente: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: '#3d3d3d' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={16} style={{ marginRight: 5 }} /> Salvar
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    padding: 2rem;
                    background: #1e1e1e;
                    border: 1px solid #333;
                    border-radius: 8px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                }
                .btn-icon:hover { color: white; }
            `}</style>
        </div>
    );
}
