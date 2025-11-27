import React, { useState, useEffect } from 'react';
import { type Book } from '../../services/library';

interface BookFormProps {
    initialData?: Book;
    onSubmit: (book: Omit<Book, 'id'>) => void;
    onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setAuthor(initialData.author);
            setIsbn(initialData.isbn);
            setQuantity(initialData.quantity);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            author,
            isbn,
            quantity
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                <h2 style={{ marginTop: 0, color: '#1f2937' }}>{initialData ? 'Editar Libro' : 'Registrar Nuevo Libro'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="Ej. Cien años de soledad"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Autor</label>
                        <input
                            type="text"
                            className="form-input"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            required
                            placeholder="Ej. Gabriel García Márquez"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ISBN</label>
                        <input
                            type="text"
                            className="form-input"
                            value={isbn}
                            onChange={e => setIsbn(e.target.value)}
                            required
                            placeholder="Ej. 978-0307474728"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cantidad</label>
                        <input
                            type="number"
                            className="form-input"
                            value={quantity}
                            onChange={e => setQuantity(parseInt(e.target.value))}
                            required
                            min="0"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onCancel} style={{
                            padding: '0.5rem 1rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookForm;
