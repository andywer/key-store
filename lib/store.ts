import { createDecipher, pbkdf2Sync } from 'crypto'

type Base64String = string

export type Wallets = {
  [key: string]: Wallet
}

export type Wallet = {
  data: string,
  keyMeta: KeyMetadata,
  public: any
}

export type KeyMetadata = {
  hash: string,
  iterations: number,
  salt: string
}

export type SaveFile = (fileContent: string) => Promise<void>

export function createStore ({ saveFile, wallets = {} }: { saveFile: SaveFile, wallets?: Wallets }) {
  return {
    getWalletIDs () {
      return Object.keys(wallets)
    },
    async save () {
      // TODO
      await saveFile('')
    },
    async readWallet (walletId: string, password: string) {
      if (!(walletId in wallets)) {
        throw new Error(`Wallet ${walletId} not found in store.`)
      }
      const { data, keyMeta } = wallets[walletId]
      return JSON.parse(decryptWalletData(data, password, keyMeta))
    }
  }
}

function decryptWalletData (base64Data: Base64String, password: string, keyMeta: KeyMetadata) {
  const key = deriveKeyFromPassword(password, keyMeta)
  const decipher = createDecipher('aes-256-xts', key)
  const decrypted = decipher.update(base64Data, 'base64', 'utf8') + decipher.final('utf8')
  return decrypted
}

function deriveKeyFromPassword (password: string, { hash, iterations, salt }: KeyMetadata) {
  return pbkdf2Sync(password, Buffer.from(salt, 'hex'), iterations, 256, hash).toString('base64')
}
