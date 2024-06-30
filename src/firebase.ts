import type { ServiceAccount } from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import * as admin from 'firebase-admin'
import path from 'path'

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json')
const serviceAccount: ServiceAccount = require(serviceAccountPath)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = getFirestore()

export { db }