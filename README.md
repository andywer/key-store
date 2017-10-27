# key-store

Encrypted key store written in TypeScript. Saves arbitrary JSON data encrypted using AES-256 to the disk.

Features:

* Strong AES encryption to securily store sensible data
* Supports distinct passwords for each wallet
* Can store publicly readable data for each wallet, too

**Attention: The data is stored in a truly secure way. If you loose your password you will not be able to recover the wallet data! So please make sure to store a backup of the private data at a safe place.**


## Installation

```sh
npm install --save key-store
# or using yarn
yarn add key-store
```


## Concept

You can read and write to a store file using this library. The store file contains a set of wallets that initially will be empty. Each wallet can store arbitrary encrypted and public (unencrypted) data. To read and write the encrypted wallet data you need to provide a password used for encryption.

The store is a UTF-8-encoded text file, containing JSON-encoded data. Each wallet is stored within the JSON-encoded structure. Wallet data is saved as an AES256-XTS-encrypted JSON-encoded string, the key for the AES encryption is derived from the password using PBKDF2.


## API

### Exports

#### storeExists(storePath: string): Promise<bool>
#### createStore(storePath: string): Promise<Store>
#### loadStore(storePath: string): Promise<Store>
#### loadOrCreateStore(storePath: string): Promise<Store>

### Store

#### store.getWalletIDs(): string[]
#### store.readWallet(walletID: string, password: string): Promise<WalletData>
#### store.saveWallet(walletID: string, password: string, data: WalletData): Promise<void>
#### store.removeWallet(walletID: string): Promise<void>
#### store.readWalletPublicData(walletID: string): Promise<WalletData>
#### store.saveWalletPublicData(walletID: string, data: WalletData): Promise<void>

#### WalletData

Can be any kind of value that is JSON encodable/decodable (object, array, string, ...).


## Example

```js
import { loadStore } from 'key-store'

const store = await loadStore('~/.wallets')
const allWalletIDs = await store.getWalletIDs()

console.log(`All available wallets: ${allWalletIDs.join(', ')}`)

await store.saveWallet('my-wallet', 'arbitrary password', { privateKey: 'super secret private key' })
console.log(`Created a new wallet named 'my-wallet'.`)

const { privateKey } = await store.readWallet('my-wallet', 'arbitrary password')
console.log(`Stored private key: ${privateKey}`)
```


## Browser support

The library as is will not run in a browser, due to the `fs` dependency. But it should be fairly simple to get it to work in a browser by skipping the index file that contains the store loading and saving logic:

```js
import { createStore } from 'key-store/lib/store'

const wallets = JSON.parse(window.localStore.getItem('wallets'))
const saveFile = async content => {
  window.localStore.setItem('wallets', content)
}

const store = createStore({ saveFile, wallets })
```

Webpack will automatically polyfill the `crypto` module and the code should run just fine.


## License

MIT
