import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';

const AdminDashboard: React.FC = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="container">
            <header className="header">
                <h1>Panel de Administración</h1>
                <div className="user-info">
                    <span>Bienvenido, {user?.name} ({user?.role})</span>
                    <button onClick={() => { authService.logout(); window.location.href = '/login'; }}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="dashboard-grid">
                <div className="card">
                    <h2>Gestión de Usuarios</h2>
                    <p>Administrar usuarios, roles y permisos.</p>
                    <Link to="/admin/users" className="button">Ir a Usuarios</Link>
                </div>

                <div className="card">
                    <h2>Inventario (Bienes)</h2>
                    <p>Acceso completo al módulo de inventario.</p>
                    <Link to="/inventory" className="button">Ir a Inventario</Link>
                </div>

                <div className="card">
                    <h2>Biblioteca</h2>
                    <p>Acceso completo al módulo de biblioteca.</p>
                    <Link to="/library" className="button">Ir a Biblioteca</Link>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
