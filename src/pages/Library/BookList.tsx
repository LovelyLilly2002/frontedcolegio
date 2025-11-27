import React, { useEffect, useState } from 'react';
import { libraryService, type Book } from '../../services/library';
import { authService } from '../../services/auth';
import BookForm from './BookForm';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const user = authService.getCurrentUser();
    const isGeneral = user?.role === 'General';

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

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

    const handleCreate = async (bookData: Omit<Book, 'id'>) => {
        try {
            await libraryService.addBook(bookData);
            setMessage({ text: 'Libro registrado correctamente', type: 'success' });
            setIsFormOpen(false);
            refreshBooks();
        } catch (err) {
            setMessage({ text: 'Error al registrar el libro', type: 'error' });
        }
    };

    const handleUpdate = async (bookData: Omit<Book, 'id'>) => {
        if (!editingBook) return;
        try {
            await libraryService.updateBook({ ...bookData, id: editingBook.id });
            setMessage({ text: 'Libro actualizado correctamente', type: 'success' });
            setIsFormOpen(false);
            setEditingBook(undefined);
            refreshBooks();
        } catch (err) {
            setMessage({ text: 'Error al actualizar el libro', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este libro?')) return;
        try {
            await libraryService.deleteBook(id);
            setMessage({ text: 'Libro eliminado correctamente', type: 'success' });
            refreshBooks();
        } catch (err) {
            if (err instanceof Error) {
                setMessage({ text: err.message, type: 'error' });
            }
        }
    };

    const openEdit = (book: Book) => {
        setEditingBook(book);
        setIsFormOpen(true);
    };

    const canManage = user?.role === 'Biblioteca' || user?.role === 'Admin';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#4f46e5' }}>Inventario de Libros</h3>
                {canManage && (
                    <button
                        className="btn-primary"
                        style={{ width: 'auto' }}
                        onClick={() => { setEditingBook(undefined); setIsFormOpen(true); }}
                    >
                        + Nuevo Libro
                    </button>
                )}
            </div>

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
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Acción</th>
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
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {isGeneral && (
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
                                    )}
                                    {canManage && (
                                        <>
                                            <button
                                                onClick={() => openEdit(book)}
                                                style={{ marginRight: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 600 }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600 }}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <BookForm
                    initialData={editingBook}
                    onSubmit={editingBook ? handleUpdate : handleCreate}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default BookList;
