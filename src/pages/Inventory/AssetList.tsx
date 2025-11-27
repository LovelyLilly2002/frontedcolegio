import React, { useState, useEffect } from 'react';
import { inventoryService, type Asset } from '../../services/inventory';
import AssetForm from './AssetForm';

const AssetList: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const refreshAssets = () => {
        const allAssets = inventoryService.getAssets();
        setAssets(allAssets);
        setFilteredAssets(allAssets);
    };

    useEffect(() => {
        refreshAssets();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = assets.filter(a => {
            const matchesSearch = a.name.toLowerCase().includes(lowerTerm) || a.code.toLowerCase().includes(lowerTerm);
            const matchesType = filterType === 'all' || a.type === filterType;
            const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
        setFilteredAssets(filtered);
    }, [searchTerm, filterType, filterStatus, assets]);

    const handleCreate = async (assetData: Omit<Asset, 'id' | 'status'>) => {
        try {
            await inventoryService.addAsset(assetData);
            setMessage({ text: 'Bien registrado correctamente', type: 'success' });
            setIsFormOpen(false);
            refreshAssets();
        } catch (err) {
            setMessage({ text: 'Error al registrar el bien', type: 'error' });
        }
    };

    const handleUpdate = async (assetData: Omit<Asset, 'id' | 'status'>) => {
        if (!editingAsset) return;
        try {
            await inventoryService.updateAsset({ ...assetData, id: editingAsset.id, status: editingAsset.status, currentHolder: editingAsset.currentHolder });
            setMessage({ text: 'Bien actualizado correctamente', type: 'success' });
            setIsFormOpen(false);
            setEditingAsset(undefined);
            refreshAssets();
        } catch (err) {
            setMessage({ text: 'Error al actualizar el bien', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este bien?')) return;
        try {
            await inventoryService.deleteAsset(id);
            setMessage({ text: 'Bien eliminado correctamente', type: 'success' });
            refreshAssets();
        } catch (err) {
            if (err instanceof Error) {
                setMessage({ text: err.message, type: 'error' });
            }
        }
    };

    const openEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsFormOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ minWidth: '250px' }}
                    />
                    <select
                        className="form-input"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="all">Todos los Tipos</option>
                        <option value="Mobile">Móvil</option>
                        <option value="Immobile">Inmóvil</option>
                    </select>
                    <select
                        className="form-input"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="Available">Disponible</option>
                        <option value="Loaned">Prestado</option>
                        <option value="Assigned">Asignado</option>
                        <option value="Maintenance">Mantenimiento</option>
                    </select>
                </div>
                <button
                    className="btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => { setEditingAsset(undefined); setIsFormOpen(true); }}
                >
                    + Nuevo Bien
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
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
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Código</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Ubicación/Poseedor</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{asset.code}</td>
                                <td style={{ padding: '1rem' }}>{asset.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem',
                                        background: asset.type === 'Mobile' ? '#e0e7ff' : '#fce7f3',
                                        color: asset.type === 'Mobile' ? '#4338ca' : '#be185d'
                                    }}>
                                        {asset.type === 'Mobile' ? 'Móvil' : 'Inmóvil'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500,
                                        background: asset.status === 'Available' ? '#d1fae5' : '#fef3c7',
                                        color: asset.status === 'Available' ? '#059669' : '#d97706'
                                    }}>
                                        {asset.status === 'Available' ? 'Disponible' :
                                            asset.status === 'Loaned' ? 'Prestado' :
                                                asset.status === 'Assigned' ? 'Asignado' : 'Mantenimiento'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {asset.currentHolder ? asset.currentHolder.userName : '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => openEdit(asset)}
                                        style={{ marginRight: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 600 }}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600 }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <AssetForm
                    initialData={editingAsset}
                    onSubmit={editingAsset ? handleUpdate : handleCreate}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default AssetList;
