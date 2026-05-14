import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, "..")
const maxBatchOperations = 500
const collections = [
  {
    collectionName: "categories",
    fileName: "categories.example.json",
  },
  {
    collectionName: "products",
    fileName: "products.example.json",
  },
  {
    collectionName: "orders",
    fileName: "orders.example.json",
  },
]

async function loadEnvFile(fileName) {
  try {
    const rawEnv = await readFile(path.join(projectRoot, fileName), "utf8")

    for (const line of rawEnv.split(/\r?\n/)) {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue
      }

      const separatorIndex = trimmedLine.indexOf("=")

      if (separatorIndex === -1) {
        continue
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^["']|["']$/g, "")

      process.env[key] ??= value
    }
  } catch {
    // Environment files are optional; CI can provide the variables directly.
  }
}

function getFirebasePrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
}

function assertFirebaseEnv() {
  const missingVariables = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ].filter((key) => !process.env[key])

  if (missingVariables.length > 0) {
    throw new Error(
      `Variaveis de ambiente ausentes: ${missingVariables.join(", ")}`
    )
  }
}

function getDocumentId(id) {
  return encodeURIComponent(id)
}

function removeUndefinedFields(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedFields)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) =>
        item === undefined ? [] : [[key, removeUndefinedFields(item)]]
      )
    )
  }

  return value
}

function getCurrentLocalDate() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date())
}

function setOrdersCurrentDate(data) {
  const currentDate = getCurrentLocalDate()

  return data.map((item) => ({
    ...item,
    datetime:
      typeof item.datetime === "string"
        ? item.datetime.replace(/^\d{4}-\d{2}-\d{2}/, currentDate)
        : item.datetime,
  }))
}

async function readExampleData(fileName) {
  const filePath = path.join(projectRoot, "data", fileName)
  const data = JSON.parse(await readFile(filePath, "utf8"))

  if (
    !Array.isArray(data) ||
    data.some((item) => !item || typeof item.id !== "string")
  ) {
    throw new Error(`Arquivo invalido: data/${fileName}`)
  }

  return data
}

async function commitBatch(batch, operations) {
  if (operations > 0) {
    await batch.commit()
  }
}

async function seedCollection(db, collectionName, data) {
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

async function main() {
  await loadEnvFile(".env.local")
  await loadEnvFile(".env")
  assertFirebaseEnv()

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getFirebasePrivateKey(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
    })
  const db = getFirestore(app)

  for (const { collectionName, fileName } of collections) {
    const exampleData = await readExampleData(fileName)
    const data =
      collectionName === "orders"
        ? setOrdersCurrentDate(exampleData)
        : exampleData

    await seedCollection(db, collectionName, data)
    console.log(`${collectionName}: ${data.length} documentos gravados`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
