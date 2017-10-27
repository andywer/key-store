import { createCipher, createDecipher, pbkdf2Sync, randomBytes } from 'crypto'

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
  const save = () => saveFile(stringifyStore({ wallets }))

  return {
    getWalletIDs () {
      return Object.keys(wallets)
    },
    async save () {
      await save()
    },
    async readWallet (walletId: string, password: string) {
      if (!(walletId in wallets)) {
        throw new Error(`Wallet ${walletId} not found in store.`)
      }
      const { data, keyMeta } = wallets[walletId]
      const decrypted = decryptWalletData(data, password, keyMeta)
      try {
        return JSON.parse(decrypted)
      } catch (error) {
        throw new Error(`Cannot parse decrypted wallet ${walletId}. The provided password is probably wrong.`)
      }
    },
    async saveWallet (walletId: string, password: string, walletData: any, keyMeta?: KeyMetadata) {
      if (!keyMeta) {
        keyMeta = walletId in wallets ? wallets[walletId].keyMeta : await createKeyMetadata()
      }
      const data = encryptWalletData(JSON.stringify(walletData), password, keyMeta)
      wallets[walletId] = { data, keyMeta, public: null }
      await save()
    },
    async removeWallet (walletId: string) {
      if (!(walletId in wallets)) {
        throw new Error(`Wallet ${walletId} not found in store.`)
      }
      delete wallets[walletId]
      await save()
    },
    async saveWalletPublicData (walletId: string, publicData: any) {
      if (!(walletId in wallets)) {
        throw new Error(`Wallet ${walletId} not found in store.`)
      }
      wallets[walletId].public = publicData
      await save()
    },
    async readWalletPublicData (walletId: string) {
      if (!(walletId in wallets)) {
        throw new Error(`Wallet ${walletId} not found in store.`)
      }
      return wallets[walletId].public
    }
  }
}

function encryptWalletData (stringData: string, password: string, keyMeta: KeyMetadata) {
  const key = deriveKeyFromPassword(password, keyMeta)
  const cipher = createCipher('aes-256-xts', key)
  const encrypted = cipher.update(stringData, 'utf8', 'base64') + cipher.final('base64')
  return encrypted
}

function decryptWalletData (base64Data: Base64String, password: string, keyMeta: KeyMetadata): string {
  const key = deriveKeyFromPassword(password, keyMeta)
  const decipher = createDecipher('aes-256-xts', key)
  const decrypted = decipher.update(base64Data, 'base64', 'utf8') + decipher.final('utf8')
  return decrypted
}

function deriveKeyFromPassword (password: string, { hash, iterations, salt }: KeyMetadata) {
  return pbkdf2Sync(password, Buffer.from(salt, 'hex'), iterations, 256, hash).toString('base64')
}

async function createKeyMetadata () {
  const buffer = await createRandomBuffer(8)
  return {
    hash: 'sha256',
    iterations: 20000,
    salt: buffer.toString('hex')
  }
}

function createRandomBuffer (sizeInBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    randomBytes(sizeInBytes, (error, buffer: Buffer) => error ? reject(error) : resolve(buffer))
  })
}

function stringifyStore ({ wallets }: { wallets: Wallets }) {
  return JSON.stringify({
    version: 1,
    wallets
  })
}
