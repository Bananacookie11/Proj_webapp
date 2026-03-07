import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAW30b2tB1bWA8_DcSuw-TToEQdF6nPg0Y",
  authDomain: "smart-plant-care-2e913.firebaseapp.com",
  projectId: "smart-plant-care-2e913",
  storageBucket: "smart-plant-care-2e913.firebasestorage.app",
  messagingSenderId: "310559984560",
  appId: "1:310559984560:web:e4390f4ea4d1e65fd62475",
  measurementId: "G-P8ND23DSE9"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)