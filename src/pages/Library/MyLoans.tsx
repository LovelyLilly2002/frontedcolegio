import React, { useEffect, useState } from 'react';
import { libraryService, type Loan } from '../../services/library';
import { authService } from '../../services/auth';

const MyLoans: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            const userLoans = libraryService.getUserLoans(user.username);
            // Sort by date desc
            userLoans.sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
            setLoans(userLoans);
        }
    }, []);

    const getStatusBadge = (status: Loan['status']) => {
        switch (status) {
            case 'Active': return { bg: '#d1fae5', color: '#059669', label: 'Prestado' };
            case 'Returned': return { bg: '#f3f4f6', color: '#6b7280', label: 'Devuelto' };
            case 'Pending': return { bg: '#fef3c7', color: '#d97706', label: 'Pendiente' };
            case 'Rejected': return { bg: '#fee2e2', color: '#dc2626', label: 'Rechazado' };
            default: return { bg: '#f3f4f6', color: '#6b7280', label: status };
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: '#4f46e5' }}>Mis Solicitudes y Préstamos</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Libro</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>No tienes solicitudes registradas</td></tr>
                        ) : (
                            loans.map(loan => {
                                const badge = getStatusBadge(loan.status);
                                return (
                                    <tr key={loan.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '1rem' }}>{loan.bookTitle}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.85rem',
                                                background: badge.bg,
                                                color: badge.color,
                                                fontWeight: 500
                                            }}>
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyLoans;
