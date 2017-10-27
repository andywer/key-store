declare function storeFileExists(filePath: string): Promise<any>;
declare function createStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
    saveWallet(walletId: string, password: string, walletData: any, keyMeta?: {
        hash: string;
        iterations: number;
        salt: string;
    } | undefined): Promise<void>;
    removeWallet(walletId: string): Promise<void>;
}>;
declare function loadStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
    saveWallet(walletId: string, password: string, walletData: any, keyMeta?: {
        hash: string;
        iterations: number;
        salt: string;
    } | undefined): Promise<void>;
    removeWallet(walletId: string): Promise<void>;
}>;
declare function loadOrCreateStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
    saveWallet(walletId: string, password: string, walletData: any, keyMeta?: {
        hash: string;
        iterations: number;
        salt: string;
    } | undefined): Promise<void>;
    removeWallet(walletId: string): Promise<void>;
}>;
export { createStoreFile as createStore, loadStoreFile as loadStore, loadOrCreateStoreFile as loadOrCreateStore, storeFileExists as storeExists };
