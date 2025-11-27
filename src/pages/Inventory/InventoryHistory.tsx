import React, { useState, useEffect } from 'react';
import { inventoryService, type AssetTransaction } from '../../services/inventory';

const InventoryHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<AssetTransaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        const allTrans = inventoryService.getTransactions();
        allTrans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allTrans);
    }, []);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Buscar en historial (Bien o Usuario)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px', flex: 1 }}
                />
                <select
                    className="form-input"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="all">Todos los Tipos</option>
                    <option value="Loan">Préstamos</option>
                    <option value="Assignment">Asignaciones</option>
                    <option value="Return">Devoluciones</option>
                </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Bien</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Devolución</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No hay movimientos registrados</td></tr>
                        ) : (
                            filteredTransactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(t.date).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem',
                                            background: t.type === 'Loan' ? '#e0e7ff' : t.type === 'Assignment' ? '#fce7f3' : '#d1fae5',
                                            color: t.type === 'Loan' ? '#4338ca' : t.type === 'Assignment' ? '#be185d' : '#065f46'
                                        }}>
                                            {t.type === 'Loan' ? 'Préstamo' : t.type === 'Assignment' ? 'Asignación' : 'Devolución'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{t.assetName}</td>
                                    <td style={{ padding: '1rem' }}>{t.userName}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {t.returnDate ? new Date(t.returnDate).toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryHistory;
