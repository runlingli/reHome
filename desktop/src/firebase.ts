// Firebase web SDK init for the desktop app.
// Same project as iOS (rehome-495823); web app registered separately.

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  projectId:         'rehome-495823',
  appId:             '1:952757494827:web:d7a13515b95e62a187b66e',
  storageBucket:     'rehome-495823-media',  // custom bucket (canonical .firebasestorage.app not provisioned)
  apiKey:            'AIzaSyDFMQLsBmrL_woU8XcnKWVGU7TnyQv1qP8',
  authDomain:        'rehome-495823.firebaseapp.com',
  messagingSenderId: '952757494827',
}

export const app             = initializeApp(firebaseConfig)
export const auth            = getAuth(app)
export const db              = getFirestore(app)
export const storage         = getStorage(app)
export const googleProvider  = new GoogleAuthProvider()
