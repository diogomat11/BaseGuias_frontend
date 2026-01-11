import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange
}) {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalItems === 0) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
                    Total: <strong>{totalItems}</strong> registros
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '0.3rem', borderRadius: '4px' }}
                >
                    <option value={10}>10 por pág.</option>
                    <option value={25}>25 por pág.</option>
                    <option value={50}>50 por pág.</option>
                    <option value={100}>100 por pág.</option>
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                    className="btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    style={{ padding: '0.4rem 0.8rem', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                    <ChevronLeft size={16} />
                </button>

                <span style={{ fontSize: '0.9rem' }}>
                    Página {currentPage} de {totalPages}
                </span>

                <button
                    className="btn"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    style={{ padding: '0.4rem 0.8rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
