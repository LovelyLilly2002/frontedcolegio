import React, { useState, useEffect } from 'react';
import { inventoryService, type Asset } from '../../services/inventory';
import { authService, type User } from '../../services/auth';

const TransactionManager: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const refreshAssets = () => {
        setAssets(inventoryService.getAssets());
    };

    useEffect(() => {
        refreshAssets();
    }, []);

    const handleSearchUser = () => {
        // Mock search: In a real app we'd have a userService.search(query)
        // Here we just check if the current user matches for simplicity or iterate all users if we had access
        // Since we don't have a getAllUsers in authService, we'll simulate finding a user by exact username match from localStorage if possible
        // or just use a mock approach. 
        // BETTER APPROACH: Let's assume we can assign to ANY username string for now, 
        // OR we can try to find in the 'colegio_users' from localStorage directly here for this specific requirement.

        const usersStr = localStorage.getItem('colegio_users');
        if (usersStr) {
            const users: User[] = JSON.parse(usersStr);
            const user = users.find(u => u.username === searchUser || u.name.includes(searchUser));
            if (user) {
                setFoundUser(user);
                setMessage(null);
            } else {
                setFoundUser(null);
                setMessage({ text: 'Usuario no encontrado', type: 'error' });
            }
        }
    };

    const handleAssign = async () => {
        if (!foundUser || !selectedAssetId) return;

        const asset = assets.find(a => a.id === selectedAssetId);
        if (!asset) return;

        try {
            const type = asset.type === 'Mobile' ? 'Loan' : 'Assignment';
            await inventoryService.assignAsset(selectedAssetId, foundUser, type);
            setMessage({ text: `Bien ${type === 'Loan' ? 'prestado' : 'asignado'} correctamente`, type: 'success' });
            setSelectedAssetId('');
            setFoundUser(null);
            setSearchUser('');
            refreshAssets();
        } catch (err) {
            if (err instanceof Error) {
                setMessage({ text: err.message, type: 'error' });
            }
        }
    };

    const handleReturn = async (assetId: string) => {
        try {
            await inventoryService.returnAsset(assetId);
            setMessage({ text: 'Bien devuelto correctamente', type: 'success' });
            refreshAssets();
        } catch (err) {
            if (err instanceof Error) {
                setMessage({ text: err.message, type: 'error' });
            }
        }
    };

    const activeAssets = assets.filter(a => {
        const isActive = a.status === 'Loaned' || a.status === 'Assigned';
        if (!isActive) return false;
        if (foundUser) {
            return a.currentHolder?.userId === foundUser.username;
        }
        return true;
    });
    const availableAssets = assets.filter(a => a.status === 'Available');

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Assignment Section */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#4f46e5' }}>Nueva Asignación / Préstamo</h3>

                    <div className="form-group">
                        <label className="form-label">Buscar Usuario (Username o Nombre)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                placeholder="Ej. jperez"
                            />
                            <button onClick={handleSearchUser} className="btn-primary" style={{ width: 'auto' }}>
                                Buscar
                            </button>
                        </div>
                    </div>

                    {foundUser && (
                        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            <strong>Usuario Seleccionado:</strong> {foundUser.name} {foundUser.surname} ({foundUser.role})
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Seleccionar Bien Disponible</label>
                        <select
                            className="form-input"
                            value={selectedAssetId}
                            onChange={e => setSelectedAssetId(e.target.value)}
                            disabled={!foundUser}
                        >
                            <option value="">Seleccione un bien...</option>
                            {availableAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.code} - {asset.name} ({asset.type === 'Mobile' ? 'Móvil' : 'Inmóvil'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAssign}
                        className="btn-primary"
                        disabled={!foundUser || !selectedAssetId}
                        style={{ opacity: (!foundUser || !selectedAssetId) ? 0.5 : 1 }}
                    >
                        Registrar Movimiento
                    </button>

                    {message && (
                        <div style={{
                            marginTop: '1rem', padding: '0.5rem', borderRadius: '4px',
                            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                            color: message.type === 'success' ? '#065f46' : '#991b1b'
                        }}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Active Assignments List */}
                <div>
                    <h3 style={{ marginTop: 0, color: '#1f2937' }}>
                        {foundUser ? `Bienes en poder de ${foundUser.name}` : 'Todos los Bienes Asignados / Prestados'}
                    </h3>
                    <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead style={{ background: '#f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Bien</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Poseedor</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tipo</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeAssets.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No hay bienes asignados actualmente</td></tr>
                                ) : (
                                    activeAssets.map(asset => (
                                        <tr key={asset.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: 500 }}>{asset.code}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{asset.name}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>{asset.currentHolder?.userName}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                    background: asset.status === 'Loaned' ? '#e0e7ff' : '#fce7f3',
                                                    color: asset.status === 'Loaned' ? '#4338ca' : '#be185d'
                                                }}>
                                                    {asset.status === 'Loaned' ? 'Préstamo' : 'Asignación'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleReturn(asset.id)}
                                                    style={{ padding: '0.25rem 0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
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
            </div>
        </div>
    );
};

export default TransactionManager;
