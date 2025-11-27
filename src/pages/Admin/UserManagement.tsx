import React, { useState, useEffect } from 'react';
import { authService, type User, type UserRole } from '../../services/auth';
import { Link } from 'react-router-dom';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (username: string) => {
        if (window.confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) {
            try {
                await authService.deleteUser(username);
                loadUsers();
            } catch (error) {
                alert('Error al eliminar usuario');
            }
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData(user);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            await authService.updateUser(editingUser.username, formData);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            alert('Error al actualizar usuario');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) return <div>Cargando usuarios...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Gestión de Usuarios</h1>
                <Link to="/admin" className="button secondary">Volver al Panel</Link>
            </header>

            {editingUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Usuario: {editingUser.username}</h2>
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellido:</label>
                            <input
                                name="surname"
                                value={formData.surname || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Rol:</label>
                            <select
                                name="role"
                                value={formData.role || 'General'}
                                onChange={handleChange}
                            >
                                <option value="General">General</option>
                                <option value="Bienes">Bienes</option>
                                <option value="Biblioteca">Biblioteca</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div className="actions">
                            <button onClick={handleSave} className="button primary">Guardar</button>
                            <button onClick={() => setEditingUser(null)} className="button secondary">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <table className="table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.username}>
                            <td>{user.username}</td>
                            <td>{user.name} {user.surname}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleEdit(user)} className="button small">Editar</button>
                                <button onClick={() => handleDelete(user.username)} className="button small danger">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
