import * as fs from 'fs'
import pify = require('pify')
import { createStore, Wallets } from './store'

const readFile = pify(fs.readFile)
const stat = pify(fs.stat)
const writeFile = pify(fs.writeFile)

const save = (filePath: string) => async (fileContent: string) => {
  await writeFile(filePath, fileContent, { encoding: 'utf-8' })
}

async function storeFileExists (filePath: string) {
  try {
    const fileStat = await stat(filePath)
    return fileStat.isFile()
  } catch (error) {
    return false
  }
}

async function createStoreFile (filePath: string) {
  const store = createStore({ saveFile: save(filePath) })
  await store.save()
  return store
}

async function loadStoreFile (filePath: string) {
  const parsedFileContent = JSON.parse(await readFile(filePath))
  const { wallets }: { wallets: Wallets } = parsedFileContent
  return createStore({ saveFile: save(filePath), wallets })
}

async function loadOrCreateStoreFile (filePath: string) {
  if (await storeFileExists(filePath)) {
    return loadStoreFile(filePath)
  } else {
    return createStoreFile(filePath)
  }
}

export {
  createStoreFile as createStore,
  loadStoreFile as loadStore,
  loadOrCreateStoreFile as loadOrCreateStore,
  storeFileExists as storeExists
}
