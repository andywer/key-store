import test from 'ava'
import * as fs from 'fs'
import * as path from 'path'
import * as temp from 'temp'
import pify = require('pify')
import { createStore, loadStore } from '../lib'

temp.track()

const fixturesDirPath = path.join(__dirname, '_fixtures')
const readFile = pify(fs.readFile)

test('store.getWalletIDs() returns all wallet IDs', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  t.deepEqual(store.getWalletIDs(), ['sample-wallet'])
})

test('store.readWallet() can decrypt and decode a wallet', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  const data = await store.readWallet('sample-wallet', 'password')
  t.deepEqual(data, { privateKey: 'superSecretKey' })
})

test('store.readWallet() throws proper error on wrong password', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  await t.throws(
    store.readWallet('sample-wallet', 'wrong password'),
    /The provided password is probably wrong/
  )
})

test('store.saveWallet() can save a new wallet', async t => {
  const filePath = temp.path()
  const store = await createStore(filePath)

  await store.saveWallet('walletID', 'somePassword', { privateKey: 'secretPrivateKey' })

  t.deepEqual(store.getWalletIDs(), ['walletID'])
  t.deepEqual(await store.readWallet('walletID', 'somePassword'), { privateKey: 'secretPrivateKey' })

  const reloadedStore = await loadStore(filePath)

  t.deepEqual(reloadedStore.getWalletIDs(), ['walletID'])
  t.deepEqual(await reloadedStore.readWallet('walletID', 'somePassword'), { privateKey: 'secretPrivateKey' })
})

test('store.saveWallet() can update an existing wallet', async t => {
  const filePath = temp.path()
  const store = await createStore(filePath)

  await store.saveWallet('walletID', 'somePassword', { privateKey: 'secretPrivateKey' })
  await store.saveWallet('walletID', 'somePassword', { privateKey: 'newPrivateKey' })

  t.deepEqual(await store.readWallet('walletID', 'somePassword'), { privateKey: 'newPrivateKey' })

  let reloadedStore = await loadStore(filePath)
  t.deepEqual(await reloadedStore.readWallet('walletID', 'somePassword'), { privateKey: 'newPrivateKey' })

  await store.saveWallet('walletID', 'newPassword', { privateKey: 'newPrivateKey' })
  t.deepEqual(await store.readWallet('walletID', 'newPassword'), { privateKey: 'newPrivateKey' })

  reloadedStore = await loadStore(filePath)
  t.deepEqual(await reloadedStore.readWallet('walletID', 'newPassword'), { privateKey: 'newPrivateKey' })
})

test('store.removeWallet() can delete a wallet from the store', async t => {
  const filePath = temp.path()
  const store = await createStore(filePath)

  await store.saveWallet('walletID', 'somePassword', { privateKey: 'secretPrivateKey' })
  t.deepEqual(store.getWalletIDs(), ['walletID'])

  await store.removeWallet('walletID')
  t.deepEqual(store.getWalletIDs(), [])

  const reloadedStore = await loadStore(filePath)
  t.deepEqual(reloadedStore.getWalletIDs(), [])
})

test('store.readWalletPublicData() can read the unencrypted wallet metadata', async t => {
  const store = await loadStore(path.join(fixturesDirPath, 'sample-store'))
  const data = await store.readWalletPublicData('sample-wallet')
  t.deepEqual(data, { publicKey: 'publicKey' })
})

test('store.saveWalletPublicData() can save unencrypted wallet metadata', async t => {
  const filePath = temp.path()
  const store = await createStore(filePath)

  await store.saveWallet('walletID', 'somePassword', { privateKey: 'secretPrivateKey' })
  await store.saveWalletPublicData('walletID', { publicKey: 'publicKey' })

  t.deepEqual(await store.readWalletPublicData('walletID'), { publicKey: 'publicKey' })

  const reloadedStore = await loadStore(filePath)
  t.deepEqual(await reloadedStore.readWalletPublicData('walletID'), { publicKey: 'publicKey' })
})

test('store file matches snapshot', async t => {
  const filePath = temp.path()
  const store = await createStore(filePath)

  await store.saveWallet('walletID', 'somePassword', { privateKey: 'secretPrivateKey' }, { hash: 'sha256', iterations: 20000, salt: 'abcdef012345' })
  await store.saveWalletPublicData('walletID', { publicKey: 'publicKey' })

  t.deepEqual(store.getWalletIDs(), ['walletID'])
  t.deepEqual(await store.readWallet('walletID', 'somePassword'), { privateKey: 'secretPrivateKey' })

  t.snapshot(JSON.parse(await readFile(filePath)))
})
