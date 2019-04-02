import test from 'ava'
import { createStore, KeysData } from '../src'

interface PrivateData {
  key: string
}

function createMockStorage<PublicKeyData = {}> () {
  let data: KeysData<PublicKeyData> = {}

  return {
    save (newData: KeysData<PublicKeyData>) {
      data = newData
    },
    read () {
      return data
    }
  }
}

test('can create store', t => {
  const storage = createMockStorage()
  const store = createStore<PrivateData>(storage.save)

  t.deepEqual(store.getKeyIDs(), [])
})

test('can save a key', async t => {
  type PublicData = { publicData: string }

  const storage = createMockStorage<PublicData>()
  const store = createStore<PrivateData, PublicData>(storage.save)

  await store.saveKey('sample-key', 'testpassword', { key: 'SECRET' }, { publicData: 'foo' })

  t.deepEqual(store.getKeyIDs(), ['sample-key'])
  t.deepEqual(storage.read()['sample-key'].metadata.iterations, 10000)
  t.deepEqual(storage.read()['sample-key'].public, { publicData: 'foo' })
})

test('can save multiple keys', async t => {
  type PublicData = { publicData: string }

  const storage = createMockStorage<PublicData>()
  const store = createStore<PrivateData, PublicData>(storage.save)

  await store.saveKeys([
    {keyID: 'sample-key', password: 'testpassword', privateData: { key: 'SECRET' }, publicData: { publicData: 'foo' }},
    {keyID: 'sample-key2', password: 'testpassword2', privateData: { key: 'SECRET2' }}
  ])

  t.deepEqual(store.getKeyIDs(), ['sample-key', 'sample-key2'])
  t.deepEqual(storage.read()['sample-key'].metadata.iterations, 10000)
  t.deepEqual(storage.read()['sample-key'].public, { publicData: 'foo' })
  t.deepEqual(storage.read()['sample-key2'].public, { })
  t.deepEqual(store.getPrivateKeyData('sample-key', 'testpassword'), { key: 'SECRET' })
  t.deepEqual(store.getPrivateKeyData('sample-key2', 'testpassword2'), { key: 'SECRET2' })
})

test('can read a key', async t => {
  type PublicData = { publicData: string }

  const initialData = {
    'test': {
      metadata: {
        nonce: '3kHPgnRosojK0fku0cT07hzjNlun+NQI',
        iterations: 10000
      },
      public: { publicData: 'bar' },
      private: 'y49x8eM9p2nQUkAoWO/XLCJ1uovI13Z5ZdGi26p07uc='
    }
  }

  const storage = createMockStorage<PublicData>()
  const store = createStore<PrivateData, PublicData>(storage.save, initialData)

  t.deepEqual(store.getPublicKeyData('test'), { publicData: 'bar' })
  t.deepEqual(store.getPrivateKeyData('test', 'testpassword'), { key: 'SECRET' })
})

test('can edit key public data without a password', async t => {
  type PublicData = { publicData: string }

  const initialData = {
    'test': {
      metadata: {
        nonce: '3kHPgnRosojK0fku0cT07hzjNlun+NQI',
        iterations: 10000
      },
      public: { publicData: 'foo' },
      private: 'y49x8eM9p2nQUkAoWO/XLCJ1uovI13Z5ZdGi26p07uc='
    }
  }

  const storage = createMockStorage<PublicData>()
  const store = createStore<PrivateData, PublicData>(storage.save, initialData)

  await store.savePublicKeyData('test', { publicData: 'bar' })

  t.deepEqual(store.getPublicKeyData('test'), { publicData: 'bar' })
  t.deepEqual(store.getPrivateKeyData('test', 'testpassword'), { key: 'SECRET' })
})

test('can remove a key', async t => {
  const initialData = {
    'test': {
      metadata: {
        nonce: '3kHPgnRosojK0fku0cT07hzjNlun+NQI',
        iterations: 10000
      },
      public: {},
      private: 'y49x8eM9p2nQUkAoWO/XLCJ1uovI13Z5ZdGi26p07uc='
    }
  }

  const storage = createMockStorage()
  const store = createStore<PrivateData>(storage.save, initialData)

  await store.removeKey('test')

  t.deepEqual(store.getKeyIDs(), [])
  t.deepEqual(storage.read(), {})
})
