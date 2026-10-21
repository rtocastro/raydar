
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
