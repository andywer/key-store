export interface KeyStore<PrivateKeyData, PublicKeyData> {
    getKeyIDs(): string[];
    getPublicKeyData(keyID: string): PublicKeyData;
    getPrivateKeyData(keyID: string, password: string): PrivateKeyData;
    getRawKeyData(keyID:string): RawKeyData<PublicKeyData>
    saveKey(keyID: string, password: string, privateData: PrivateKeyData, publicData?: PublicKeyData): Promise<void>;
    saveKeys(data: {
        keyID: string;
        password: string;
        privateData: PrivateKeyData;
        publicData?: PublicKeyData;
    }[]): Promise<void>;
    savePublicKeyData(keyID: string, publicData: PublicKeyData): Promise<void>;
    removeKey(keyID: string): Promise<void>;
}
interface KeyMetadata {
    nonce: string;
    iterations: number;
}
export interface RawKeyData<PublicKeyData> {
    metadata: KeyMetadata;
    public: PublicKeyData;
    private: string;
}
export interface KeysData<PublicKeyData> {
    [keyID: string]: RawKeyData<PublicKeyData>;
}
export declare type SaveKeys<PublicKeyData> = (data: KeysData<PublicKeyData>) => Promise<void> | void;
export declare function createStore<PrivateKeyData, PublicKeyData = {}>(save: SaveKeys<PublicKeyData>, initialKeys?: KeysData<PublicKeyData>, options?: {
    iterations?: number;
}): KeyStore<PrivateKeyData, PublicKeyData>;
export {};
