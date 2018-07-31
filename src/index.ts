import * as sha256 from 'fast-sha256'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'

export interface KeyStore<PrivateKeyData, PublicKeyData> {
  getKeyIDs (): string[]
  getPublicKeyData (keyID: string): PublicKeyData
  getPrivateKeyData (keyID: string, password: string): PrivateKeyData
  saveKey (keyID: string, password: string, privateData: PrivateKeyData, publicData?: PublicKeyData): Promise<void>
  removeKey (keyID: string): Promise<void>
}

interface KeyMetadata {
  nonce: string,
  iterations: number
}

export interface KeysData<PublicKeyData> {
  [keyID: string]: {
    metadata: KeyMetadata,
    public: PublicKeyData,
    private: string
  }
}

export type SaveKeys<PublicKeyData> = (data: KeysData<PublicKeyData>) => Promise<void> | void

function randomNonce () {
  return naclUtil.encodeBase64(nacl.randomBytes(nacl.secretbox.nonceLength))
}

function deriveHashFromPassword (password: string, metadata: KeyMetadata) {
  return sha256.pbkdf2(
    naclUtil.decodeUTF8(password),
    naclUtil.decodeBase64(metadata.nonce),
    metadata.iterations,
    nacl.secretbox.keyLength
  )
}

function decrypt (encryptedBase64: string, metadata: KeyMetadata, password: string) {
  const secretKey = deriveHashFromPassword(password, metadata)
  const decrypted = nacl.secretbox.open(naclUtil.decodeBase64(encryptedBase64), naclUtil.decodeBase64(metadata.nonce), secretKey)

  if (!decrypted) {
    throw new Error('Decryption failed.')
  }
  return JSON.parse(naclUtil.encodeUTF8(decrypted))
}

function encrypt (privateData: any, metadata: KeyMetadata, password: string): string {
  const secretKey = deriveHashFromPassword(password, metadata)
  const data = naclUtil.decodeUTF8(JSON.stringify(privateData))
  const encrypted = nacl.secretbox(data, naclUtil.decodeBase64(metadata.nonce), secretKey)
  return naclUtil.encodeBase64(encrypted)
}

export function createStore<PrivateKeyData, PublicKeyData = {}> (
  save: SaveKeys<PublicKeyData>,
  initialKeys: KeysData<PublicKeyData> = {},
  options: { iterations?: number } = {}
): KeyStore<PrivateKeyData, PublicKeyData> {
  const { iterations = 10000 } = options
  let keysData = initialKeys

  return {
    getKeyIDs () {
      return Object.keys(keysData)
    },
    getPublicKeyData (keyID: string) {
      return keysData[keyID].public
    },
    getPrivateKeyData (keyID: string, password: string) {
      return decrypt(keysData[keyID].private, keysData[keyID].metadata, password) as PrivateKeyData
    },
    async saveKey (keyID: string, password: string, privateData: PrivateKeyData, publicData: PublicKeyData | {} = {}) {
      const metadata = {
        nonce: randomNonce(),
        iterations
      }
      keysData[keyID] = {
        metadata,
        public: publicData as any,
        private: encrypt(privateData, metadata, password)
      }
      await save(keysData)
    },
    async removeKey (keyID: string) {
      delete keysData[keyID]
      await save(keysData)
    }
  }
}
