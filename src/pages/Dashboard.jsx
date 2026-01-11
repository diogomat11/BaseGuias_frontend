import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FileText, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem('username') || 'Usuário';

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Carregando Dashboard...</div>;
    if (!stats) return <div style={{ padding: '2rem' }}>Erro ao carregar dados.</div>;

    const { overview, jobs_status } = stats;
    const totalReq = overview.total_jobs;
    const successRate = totalReq > 0 ? ((jobs_status.success / totalReq) * 100).toFixed(1) : 0;
    const errorRate = totalReq > 0 ? ((jobs_status.error / totalReq) * 100).toFixed(1) : 0;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dashboard - {username}</h1>

            {/* Main Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Total Carteirinhas</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overview.total_carteirinhas}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: '#34d399' }}>
                        <FileText size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Total Guias</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overview.total_guias}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', color: '#fbbf24' }}>
                        <Activity size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Total Requisições (Jobs)</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overview.total_jobs}</div>
                    </div>
                </div>
            </div>

            {/* Jobs Detailed Stats */}
            <h2 style={{ marginBottom: '1rem' }}>Status das Requisições</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Sucesso</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{jobs_status.success}</div>
                        </div>
                        <CheckCircle size={24} color="#10b981" />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                        {successRate}% do total
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Erros</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{jobs_status.error}</div>
                        </div>
                        <XCircle size={24} color="#ef4444" />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                        {errorRate}% do total
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Pendentes/Process.</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{jobs_status.pending}</div>
                        </div>
                        <Clock size={24} color="#f59e0b" />
                    </div>
                </div>

            </div>
        </div>
    );
}
