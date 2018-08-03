# key-store

[![Build Status](https://travis-ci.org/andywer/key-store.svg?branch=master)](https://travis-ci.org/andywer/key-store)
[![NPM Version](https://img.shields.io/npm/v/key-store.svg)](https://www.npmjs.com/package/key-store)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Isomorphic encrypted key store. Works in node and in the browser.

Features:

* Strong encryption to securily store sensible data
* Supports distinct passwords for each key
* Can store unencrypted data alongside each key

**Attention: The data is stored in a truly secure way. If you loose your password you will not be able to recover the wallet data! So please make sure to store a backup of the private data in a safe place.**


## Installation

```sh
$ npm install --save key-store
```

Using yarn:

```sh
$ yarn add key-store
```


## Example

```js
import { createStore } from 'key-store'

const store = createStore(saveFile, initialData)

await store.saveKey('test-key', 'arbitrary password', { privateKey: 'super secret private key' })

const { privateKey } = store.getPrivateKeyData('test-key', 'arbitrary password')

console.log(`Stored private key: ${privateKey}`)
console.log(`All stored keys' IDs: ${store.getKeyIDs().join(', ')}`)
```

Writing and reading keys to a file in node is easy:

```js
import * as fs from 'fs'
import * as util from 'util'
import { createStore } from 'key-store'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

async function createFileStore (filePath) {
  const saveKeys = data => writeFile(filePath, JSON.stringify(data), 'utf8')
  const readKeys = async () => JSON.parse(await readFile(filePath, 'utf8'))

  return createStore(saveKeys, await readKeys())
}
```


## Encryption details

All data private data is encrypted using tweetnacl's `xsalsa20-poly1305` implementation. The encryption key is derived from the password using PBKDF2/SHA256. The iteration count for the PBKDF2 invocation is configurable and defaults to 10,000 rounds.


## API

Check out the [declaration file](./lib/index.d.ts).


## License

MIT
