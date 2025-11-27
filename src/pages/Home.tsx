import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type User } from '../services/auth';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
        } else {
            setUser(authService.getCurrentUser());
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;

    return (
        <div className="animate-fade-in">
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'center' }}>
                <h1 className="auth-title">¡Bienvenido, {user.name}!</h1>
                <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '2rem' }}>
                    Has iniciado sesión correctamente en el sistema del Colegio.
                </p>

                <div style={{ textAlign: 'left', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, color: '#1f2937' }}>Tus Datos:</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Usuario:</strong> {user.username}</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Rol:</strong> {user.role}</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {user.email}</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Teléfono:</strong> {user.phone}</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                    {(user.role === 'Biblioteca' || user.role === 'Admin' || user.role === 'General') && (
                        <button
                            onClick={() => navigate('/library')}
                            className="btn-primary"
                            style={{ maxWidth: '200px', background: '#4f46e5' }}
                        >
                            Ir a Biblioteca
                        </button>
                    )}

                    <button onClick={handleLogout} className="btn-primary" style={{ maxWidth: '200px', background: '#ef4444' }}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
