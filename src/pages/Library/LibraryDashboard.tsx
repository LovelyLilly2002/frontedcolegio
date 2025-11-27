import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import BookList from './BookList';
import LoanManager from './LoanManager';
import HistoryLog from './HistoryLog';
import MyLoans from './MyLoans';

const LibraryDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'books' | 'loans' | 'history' | 'my-loans'>('books');
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const isGeneral = user?.role === 'General';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1f2937', margin: 0 }}>Gestión de Biblioteca</h1>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto', margin: 0 }}>
                    Volver al Inicio
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('books')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'books' ? '3px solid #4f46e5' : '3px solid transparent',
                        color: activeTab === 'books' ? '#4f46e5' : '#6b7280',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Libros
                </button>

                {!isGeneral && (
                    <>
                        <button
                            onClick={() => setActiveTab('loans')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'loans' ? '3px solid #4f46e5' : '3px solid transparent',
                                color: activeTab === 'loans' ? '#4f46e5' : '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Préstamos
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
                    </>
                )}

                {isGeneral && (
                    <button
                        onClick={() => setActiveTab('my-loans')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'my-loans' ? '3px solid #4f46e5' : '3px solid transparent',
                            color: activeTab === 'my-loans' ? '#4f46e5' : '#6b7280',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Mis Solicitudes
                    </button>
                )}
            </div>

            <div className="animate-fade-in">
                {activeTab === 'books' && <BookList />}
                {activeTab === 'loans' && !isGeneral && <LoanManager />}
                {activeTab === 'history' && !isGeneral && <HistoryLog />}
                {activeTab === 'my-loans' && isGeneral && <MyLoans />}
            </div>
        </div>
    );
};

export default LibraryDashboard;
