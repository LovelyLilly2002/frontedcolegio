import { type User } from './auth';

export type AssetType = 'Mobile' | 'Immobile';
export type AssetStatus = 'Available' | 'Assigned' | 'Loaned' | 'Maintenance';
export type TransactionType = 'Loan' | 'Assignment' | 'Return';

export interface Asset {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: AssetType;
    acquisitionDate: string;
    status: AssetStatus;
    currentHolder?: {
        userId: string;
        userName: string;
    };
}

export interface AssetTransaction {
    id: string;
    assetId: string;
    assetName: string;
    userId: string;
    userName: string;
    type: TransactionType;
    date: string;
    returnDate?: string;
}

const ASSETS_KEY = 'colegio_assets';
const TRANSACTIONS_KEY = 'colegio_asset_transactions';

const INITIAL_ASSETS: Asset[] = [
    {
        id: '1',
        code: 'MOB-001',
        name: 'Laptop HP Pavilion',
        description: 'Laptop para uso docente',
        type: 'Mobile',
        acquisitionDate: new Date().toISOString(),
        status: 'Available'
    },
    {
        id: '2',
        code: 'INM-001',
        name: 'Escritorio Docente',
        description: 'Escritorio de madera',
        type: 'Immobile',
        acquisitionDate: new Date().toISOString(),
        status: 'Available'
    },
    {
        id: '3',
        code: 'MOB-002',
        name: 'Proyector Epson',
        description: 'Proyector para sala de reuniones',
        type: 'Mobile',
        acquisitionDate: new Date().toISOString(),
        status: 'Available'
    }
];

export const inventoryService = {
    getAssets: (): Asset[] => {
        const assetsStr = localStorage.getItem(ASSETS_KEY);
        if (!assetsStr) {
            localStorage.setItem(ASSETS_KEY, JSON.stringify(INITIAL_ASSETS));
            return INITIAL_ASSETS;
        }
        return JSON.parse(assetsStr);
    },

    getTransactions: (): AssetTransaction[] => {
        const transStr = localStorage.getItem(TRANSACTIONS_KEY);
        return transStr ? JSON.parse(transStr) : [];
    },

    addAsset: (asset: Omit<Asset, 'id' | 'status'>): Promise<void> => {
        return new Promise((resolve) => {
            const assets = inventoryService.getAssets();
            const newAsset: Asset = {
                ...asset,
                id: Date.now().toString(),
                status: 'Available'
            };
            assets.push(newAsset);
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
            resolve();
        });
    },

    updateAsset: (updatedAsset: Asset): Promise<void> => {
        return new Promise((resolve, reject) => {
            const assets = inventoryService.getAssets();
            const index = assets.findIndex(a => a.id === updatedAsset.id);
            if (index === -1) {
                reject(new Error('Bien no encontrado'));
                return;
            }
            assets[index] = updatedAsset;
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
            resolve();
        });
    },

    deleteAsset: (assetId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const assets = inventoryService.getAssets();
            const index = assets.findIndex(a => a.id === assetId);
            if (index === -1) {
                reject(new Error('Bien no encontrado'));
                return;
            }
            if (assets[index].status !== 'Available' && assets[index].status !== 'Maintenance') {
                reject(new Error('No se puede eliminar un bien que está prestado o asignado'));
                return;
            }
            assets.splice(index, 1);
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
            resolve();
        });
    },

    assignAsset: (assetId: string, user: User, type: 'Loan' | 'Assignment'): Promise<void> => {
        return new Promise((resolve, reject) => {
            const assets = inventoryService.getAssets();
            const assetIndex = assets.findIndex(a => a.id === assetId);

            if (assetIndex === -1) {
                reject(new Error('Bien no encontrado'));
                return;
            }

            const asset = assets[assetIndex];
            if (asset.status !== 'Available') {
                reject(new Error(`El bien ya está ${asset.status === 'Loaned' ? 'prestado' : 'asignado'}`));
                return;
            }

            // Update Asset
            asset.status = type === 'Loan' ? 'Loaned' : 'Assigned';
            asset.currentHolder = {
                userId: user.username,
                userName: `${user.name} ${user.surname}`
            };
            assets[assetIndex] = asset;
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));

            // Create Transaction
            const transactions = inventoryService.getTransactions();
            const newTransaction: AssetTransaction = {
                id: Date.now().toString(),
                assetId: asset.id,
                assetName: asset.name,
                userId: user.username,
                userName: `${user.name} ${user.surname}`,
                type: type,
                date: new Date().toISOString()
            };
            transactions.push(newTransaction);
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

            resolve();
        });
    },

    returnAsset: (assetId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const assets = inventoryService.getAssets();
            const assetIndex = assets.findIndex(a => a.id === assetId);

            if (assetIndex === -1) {
                reject(new Error('Bien no encontrado'));
                return;
            }

            const asset = assets[assetIndex];
            if (asset.status === 'Available') {
                reject(new Error('El bien ya está disponible'));
                return;
            }

            // Update Transaction (Find the active one)
            const transactions = inventoryService.getTransactions();
            // Find the last transaction for this asset that doesn't have a return date
            // In a real DB we'd query better, here we filter and take the last one
            const activeTransIndex = transactions.findIndex(t =>
                t.assetId === assetId && !t.returnDate && (t.type === 'Loan' || t.type === 'Assignment')
            );

            if (activeTransIndex !== -1) {
                transactions[activeTransIndex].returnDate = new Date().toISOString();
                // We also add a "Return" transaction record for clarity if needed, 
                // but updating the original transaction's returnDate is often enough. 
                // The requirement says "register return date automatically".
                // Let's also add a specific 'Return' type transaction log for history completeness
                const returnTrans: AssetTransaction = {
                    id: Date.now().toString() + '_ret',
                    assetId: asset.id,
                    assetName: asset.name,
                    userId: asset.currentHolder?.userId || 'Unknown',
                    userName: asset.currentHolder?.userName || 'Unknown',
                    type: 'Return',
                    date: new Date().toISOString()
                };
                transactions.push(returnTrans);
                localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
            }

            // Update Asset
            asset.status = 'Available';
            asset.currentHolder = undefined;
            assets[assetIndex] = asset;
            localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));

            resolve();
        });
    }
};
