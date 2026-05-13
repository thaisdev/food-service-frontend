import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

function getFirebasePrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    getFirebasePrivateKey()
  )
}

export function getFirebaseAdminDb() {
  if (!isFirebaseAdminConfigured()) {
    return null
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getFirebasePrivateKey(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      }),
    })

  return getFirestore(app)
}
