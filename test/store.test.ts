import test from 'ava'
import * as path from 'path'
import * as temp from 'temp'
import { createStore, loadStore } from '../lib'

temp.track()

const fixturesDirPath = path.join(__dirname, '_fixtures')

test('store.getWalletIDs() returns all wallet IDs', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  t.deepEqual(store.getWalletIDs(), ['sample-wallet'])
})

test('store.readWallet() can decrypt and decode a wallet', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  const data = await store.readWallet('sample-wallet', 'password')
  t.deepEqual(data, { privateKey: 'superSecretKey' })
})

test.todo('store.readWallet() throws proper error on wrong password')
test.todo('store.saveWallet() can save a new wallet')
test.todo('store file matches snapshot')
test.todo('store.saveWallet() can update an existing wallet')
test.todo('store.removeWallet() can delete a wallet from the store')
test.todo('store.readWalletPublicData() can read the unencrypted wallet metadata')
test.todo('store.saveWalletPublicData() can save unencrypted wallet metadata')
