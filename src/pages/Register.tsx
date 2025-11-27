import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type User } from '../services/auth';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<User>({
        username: '',
        password: '',
        name: '',
        surname: '',
        email: '',
        phone: '',
        role: 'General'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!formData.username || !formData.password || !formData.email) {
            setError('Por favor completa los campos obligatorios');
            setLoading(false);
            return;
        }

        try {
            await authService.register(formData);
            navigate('/login');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al registrar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Nombre</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="surname">Apellido</label>
                            <input
                                id="surname"
                                name="surname"
                                type="text"
                                className="form-input"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Usuario</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">Teléfono</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Rol</label>
                        <select
                            id="role"
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="General">General</option>
                            <option value="Bienes">Bienes</option>
                            <option value="Biblioteca">Biblioteca</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="auth-link">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
