import React, { useEffect, useState } from 'react';
import { libraryService, type Book, type Loan } from '../../services/library';
import { authService } from '../../services/auth';

const LoanManager: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
    const [selectedBookId, setSelectedBookId] = useState('');
    const [borrowerName, setBorrowerName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const refreshData = () => {
        setBooks(libraryService.getBooks());
        const allLoans = libraryService.getLoans();
        setLoans(allLoans.filter(l => l.status === 'Active'));
        setPendingLoans(allLoans.filter(l => l.status === 'Pending'));
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        try {
            await libraryService.borrowBook(selectedBookId, borrowerName, quantity, currentUser);
            setSuccess('Préstamo registrado correctamente');
            setBorrowerName('');
            setQuantity(1);
            setSelectedBookId('');
            refreshData();
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const handleReturn = async (loanId: string) => {
        try {
            await libraryService.returnBook(loanId);
            refreshData();
            setSuccess('Libro devuelto correctamente');
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const handleApprove = async (loanId: string) => {
        try {
            await libraryService.approveLoan(loanId);
            refreshData();
            setSuccess('Solicitud aprobada correctamente');
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    const handleReject = async (loanId: string) => {
        try {
            await libraryService.rejectLoan(loanId);
            refreshData();
            setSuccess('Solicitud rechazada');
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        }
    };

    return (
        <div>
            {/* Pending Requests Section */}
            {pendingLoans.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#d97706' }}>Solicitudes Pendientes</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead style={{ background: '#fff7ed' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Libro</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Solicitante</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLoans.map(loan => (
                                    <tr key={loan.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '1rem' }}>{loan.bookTitle}</td>
                                        <td style={{ padding: '1rem' }}>{loan.borrowerName}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleApprove(loan.id)}
                                                style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                onClick={() => handleReject(loan.id)}
                                                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Rechazar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#4f46e5' }}>Registrar Nuevo Préstamo</h3>
                <form onSubmit={handleBorrow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Libro</label>
                        <select
                            className="form-input"
                            value={selectedBookId}
                            onChange={e => setSelectedBookId(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar Libro...</option>
                            {books.map(b => (
                                <option key={b.id} value={b.id} disabled={b.quantity === 0}>
                                    {b.title} (Disp: {b.quantity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nombre del Solicitante</label>
                        <input
                            type="text"
                            className="form-input"
                            value={borrowerName}
                            onChange={e => setBorrowerName(e.target.value)}
                            required
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Cantidad</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value))}
                            min={1}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: 0, height: '42px' }}>
                        Prestar
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p style={{ color: '#10b981', marginTop: '0.5rem' }}>{success}</p>}
            </div>

            <h3 style={{ color: '#4f46e5' }}>Préstamos Activos</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Libro</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Solicitante</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Cant.</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha Préstamo</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No hay préstamos activos</td></tr>
                        ) : (
                            loans.map(loan => (
                                <tr key={loan.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{loan.bookTitle}</td>
                                    <td style={{ padding: '1rem' }}>{loan.borrowerName}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{loan.quantity}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(loan.loanDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleReturn(loan.id)}
                                            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Devolver
                                        </button>
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

export default LoanManager;
