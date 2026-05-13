import { type WriteBatch } from "firebase-admin/firestore"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"

type ServerStoreOptions<T extends { id: string }> = {
  collectionName: string
  parse: (rawData: string | null) => T[] | null
}

type FirestoreStoredItem<T> = T & {
  __order?: number
}

const maxBatchOperations = 500

function removeUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedFields) as T
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) =>
        item === undefined ? [] : [[key, removeUndefinedFields(item)]]
      )
    ) as T
  }

  return value
}

function stripFirestoreMetadata<T>({
  __order,
  ...item
}: FirestoreStoredItem<T>) {
  void __order

  return item as T
}

function parseFirestoreItems<T>(
  items: FirestoreStoredItem<T>[],
  parse: (rawData: string | null) => T[] | null
) {
  return parse(JSON.stringify(items.map(stripFirestoreMetadata)))
}

function getDocumentId(id: string) {
  return encodeURIComponent(id)
}

async function commitBatch(batch: WriteBatch, operations: number) {
  if (operations > 0) {
    await batch.commit()
  }
}

async function writeFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  data: T[]
) {
  const db = getFirebaseAdminDb()

  if (!db) {
    throw new Error(
      "Firebase Admin nao configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY."
    )
  }

  const collection = db.collection(collectionName)
  const existingDocs = await collection.select().get()
  const nextDocumentIds = new Set(data.map((item) => getDocumentId(item.id)))
  let batch = db.batch()
  let operations = 0

  for (const [index, item] of data.entries()) {
    batch.set(collection.doc(getDocumentId(item.id)), {
      ...removeUndefinedFields(item),
      __order: index,
    })
    operations += 1

    if (operations === maxBatchOperations) {
      await commitBatch(batch, operations)
      batch = db.batch()
      operations = 0
    }
  }

  for (const document of existingDocs.docs) {
    if (nextDocumentIds.has(document.id)) {
      continue
    }

    batch.delete(document.ref)
    operations += 1

    if (operations === maxBatchOperations) {
      await commitBatch(batch, operations)
      batch = db.batch()
      operations = 0
    }
  }

  await commitBatch(batch, operations)
}

export async function readServerStore<T extends { id: string }>({
  collectionName,
  parse,
}: ServerStoreOptions<T>) {
  const db = getFirebaseAdminDb()

  if (!db) {
    throw new Error(
      "Firebase Admin nao configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY."
    )
  }

  const snapshot = await db.collection(collectionName).orderBy("__order").get()

  const firestoreData = parseFirestoreItems(
    snapshot.docs.map((document) => document.data() as FirestoreStoredItem<T>),
    parse
  )

  if (firestoreData) {
    return firestoreData
  }

  throw new Error(`Dados invalidos na colecao "${collectionName}".`)
}

export async function writeServerStore<T extends { id: string }>(
  collectionName: string,
  data: T[]
) {
  await writeFirestoreCollection(collectionName, data)

  return data
}
