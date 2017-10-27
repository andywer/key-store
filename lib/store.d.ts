export declare type Wallets = {
    [key: string]: Wallet;
};
export declare type Wallet = {
    data: string;
    keyMeta: KeyMetadata;
    public: any;
};
export declare type KeyMetadata = {
    hash: string;
    iterations: number;
    salt: string;
};
export declare type SaveFile = (fileContent: string) => Promise<void>;
export declare function createStore({saveFile, wallets}: {
    saveFile: SaveFile;
    wallets?: Wallets;
}): {
    getWalletIDs(): string[];
    save(): Promise<void>;
    readWallet(walletId: string, password: string): Promise<any>;
};
