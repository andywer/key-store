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
