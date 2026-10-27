
const DB_NAME = 'raydar-db'
const STORE_NAME = 'photos'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function accessPhoto(mode, operation) {
  const db = await openDatabase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode)
      const store = transaction.objectStore(STORE_NAME)
      const request = operation(store)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export function savePhoto(file) {
  return accessPhoto('readwrite', store =>
    store.put(file, 'current-garden')
  )
}

export function loadPhoto() {
  return accessPhoto('readonly', store =>
    store.get('current-garden')
  )
}

export async function saveSkyPhoto(targetId, file) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('photos', 'readwrite')
    const store = transaction.objectStore('photos')

    store.put(file, `sky-${targetId}`)

    transaction.oncomplete = () => {
      db.close()
      resolve()
    }

    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

export async function loadSkyPhoto(targetId) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('photos', 'readonly')
    const store = transaction.objectStore('photos')
    const request = store.get(`sky-${targetId}`)

    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)

    transaction.oncomplete = () => db.close()
  })
}