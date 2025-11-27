import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetList from './AssetList';
import TransactionManager from './TransactionManager';
import InventoryHistory from './InventoryHistory';

const InventoryDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'history'>('inventory');
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1f2937', margin: 0 }}>Gestión de Bienes e Inventario</h1>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto', margin: 0 }}>
                    Volver al Inicio
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('inventory')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'inventory' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'inventory' ? '#4f46e5' : '#6b7280',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Inventario
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'transactions' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'transactions' ? '#4f46e5' : '#6b7280',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Préstamos y Asignaciones
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'history' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'history' ? '#4f46e5' : '#6b7280',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Historial
                </button>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'inventory' && <AssetList />}
                {activeTab === 'transactions' && <TransactionManager />}
                {activeTab === 'history' && <InventoryHistory />}
            </div>
        </div>
    );
};

export default InventoryDashboard;
