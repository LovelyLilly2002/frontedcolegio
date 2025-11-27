import React, { useState, useEffect } from 'react';
import { inventoryService, type Asset, type AssetType } from '../../services/inventory';

interface AssetFormProps {
    initialData?: Asset;
    onSubmit: (asset: Omit<Asset, 'id' | 'status'>) => void;
    onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<AssetType>('Mobile');
    const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setName(initialData.name);
            setDescription(initialData.description || '');
            setType(initialData.type);
            setAcquisitionDate(initialData.acquisitionDate.split('T')[0]);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check for unique code if creating a new asset or changing code
        if (!initialData || initialData.code !== code) {
            const allAssets = inventoryService.getAssets();
            const exists = allAssets.some(a => a.code === code);
            if (exists) {
                alert('El código de inventario ya existe. Por favor use uno único.');
                return;
            }
        }

        onSubmit({
            code,
            name,
            description,
            type,
            acquisitionDate: new Date(acquisitionDate).toISOString()
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                <h2 style={{ marginTop: 0, color: '#1f2937' }}>{initialData ? 'Editar Bien' : 'Registrar Nuevo Bien'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Código de Inventario</label>
                        <input
                            type="text"
                            className="form-input"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required
                            placeholder="Ej. MOB-001"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Ej. Laptop HP"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción (Opcional)</label>
                        <textarea
                            className="form-input"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tipo de Bien</label>
                        <select
                            className="form-input"
                            value={type}
                            onChange={e => setType(e.target.value as AssetType)}
                        >
                            <option value="Mobile">Móvil (Prestable)</option>
                            <option value="Immobile">Inmóvil (Asignable)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha de Adquisición</label>
                        <input
                            type="date"
                            className="form-input"
                            value={acquisitionDate}
                            onChange={e => setAcquisitionDate(e.target.value)}
                            required
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

export default AssetForm;
