export declare function createStore({saveFile, wallets}: {
    saveFile: Function;
    wallets?: object;
}): {
    getWalletIDs(): string[];
    save(): Promise<void>;
};
