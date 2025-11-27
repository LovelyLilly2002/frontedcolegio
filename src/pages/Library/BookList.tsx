import React, { useEffect, useState } from 'react';
import { libraryService, type Book } from '../../services/library';
import { authService } from '../../services/auth';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const user = authService.getCurrentUser();
    const isGeneral = user?.role === 'General';

    const refreshBooks = () => {
        setBooks(libraryService.getBooks());
    };

    useEffect(() => {
        refreshBooks();
    }, []);

    const handleRequest = async (bookId: string) => {
        if (!user) return;
        setMessage(null);
        try {
            await libraryService.requestLoan(bookId, user);
            setMessage({ text: 'Solicitud enviada correctamente', type: 'success' });
        } catch (err) {
            if (err instanceof Error) {
                setMessage({ text: err.message, type: 'error' });
            }
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: '#4f46e5' }}>Inventario de Libros</h3>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f3f4f6' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Título</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Autor</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>ISBN</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Disponible</th>
                            {isGeneral && <th style={{ padding: '1rem', textAlign: 'center' }}>Acción</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem' }}>{book.title}</td>
                                <td style={{ padding: '1rem' }}>{book.author}</td>
                                <td style={{ padding: '1rem' }}>{book.isbn}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: book.quantity > 0 ? '#10b981' : '#ef4444' }}>
                                    {book.quantity}
                                </td>
                                {isGeneral && (
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleRequest(book.id)}
                                            disabled={book.quantity === 0}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: book.quantity > 0 ? '#4f46e5' : '#9ca3af',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: book.quantity > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            Solicitar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookList;
