declare function storeFileExists(filePath: string): Promise<any>;
declare function createStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
}>;
declare function loadStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
}>;
declare function loadOrCreateStoreFile(filePath: string): Promise<{
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
}>;
export { createStoreFile as createStore, loadStoreFile as loadStore, loadOrCreateStoreFile as loadOrCreateStore, storeFileExists as storeExists };
