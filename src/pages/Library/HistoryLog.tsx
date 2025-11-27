import React, { useEffect, useState } from 'react';
import { libraryService, type Loan } from '../../services/library';
import { authService } from '../../services/auth';

const HistoryLog: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const isAdmin = authService.getCurrentUser()?.role === 'Admin';

    useEffect(() => {
        const allLoans = libraryService.getLoans();
        // Sort by date desc
        allLoans.sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
        setLoans(allLoans);
        setFilteredLoans(allLoans);
    }, []);

    useEffect(() => {
        if (!startDate && !endDate) {
            setFilteredLoans(loans);
            return;
        }

        const filtered = loans.filter(loan => {
            const loanDate = new Date(loan.loanDate);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);

            return loanDate >= start && loanDate <= end;
        });
        setFilteredLoans(filtered);
    }, [startDate, endDate, loans]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#4f46e5', margin: 0 }}>Historial de Transacciones</h3>

                {isAdmin && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filtrar por fecha:</span>
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: 'auto', padding: '0.4rem' }}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <span>a</span>
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: 'auto', padding: '0.4rem' }}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Libro</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Solicitante</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Registrado Por</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Cant.</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha Préstamo</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha Devolución</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center' }}>No hay registros</td></tr>
                        ) : (
                            filteredLoans.map(loan => (
                                <tr key={loan.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{loan.bookTitle}</td>
                                    <td style={{ padding: '1rem' }}>{loan.borrowerName}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>{loan.userId}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{loan.quantity}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.85rem',
                                            background: loan.status === 'Active' ? '#fef3c7' : '#d1fae5',
                                            color: loan.status === 'Active' ? '#d97706' : '#059669'
                                        }}>
                                            {loan.status === 'Active' ? 'Prestado' : 'Devuelto'}
                                        </span>
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

export default HistoryLog;
