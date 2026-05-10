// Auth helpers — wraps Firebase Auth + first-time users/{uid} doc upsert.
// Mirrors the iOS GoogleAuth + EmailVerification logic exactly.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'

const SCHOOL_MAP: Record<string, string> = {
  'ucdavis.edu':      'UC Davis',
  'berkeley.edu':     'UC Berkeley',
  'ucla.edu':         'UCLA',
  'ucsb.edu':         'UC Santa Barbara',
  'ucsc.edu':         'UC Santa Cruz',
  'uci.edu':          'UC Irvine',
  'ucsd.edu':         'UC San Diego',
  'ucr.edu':          'UC Riverside',
  'ucsf.edu':         'UCSF',
  'csus.edu':         'Sacramento State',
  'csueastbay.edu':   'CSU East Bay',
  'sfsu.edu':         'SF State',
  'mit.edu':          'MIT',
  'harvard.edu':      'Harvard University',
  'stanford.edu':     'Stanford University',
}

function schoolFromEmail(email: string): string {
  const domain = email.split('@')[1] || ''
  if (SCHOOL_MAP[domain]) return SCHOOL_MAP[domain]
  return domain.replace('.edu', '').toUpperCase()
}

function initialsFrom(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || 'U'
}

/** Sign up with email/password — writes profile doc, sends verification email. */
export async function signUpWithEmail(email: string, password: string, name: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const isEdu = email.toLowerCase().endsWith('.edu')

  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    handle:         '@' + (email.split('@')[0] || 'user'),
    school:         isEdu ? schoolFromEmail(email.toLowerCase()) : '',
    bio:            '',
    avatarColor:    '#C8553D',
    avatarInitials: initialsFrom(name),
    rating:         5.0,
    deals:          0,
    eduVerified:    false,    // promoted on link click + foreground refresh
    localVerified:  false,
    createdAt:      serverTimestamp(),
  })

  // Don't await; the verification email is best-effort.
  sendEmailVerification(cred.user).catch(err => console.warn('verify email send failed:', err))
  return cred.user
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/** Google sign-in (popup). First-time users get a profile doc with eduVerified
 *  set from the .edu suffix — Google attests `email_verified=true` on the credential. */
export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider)
  const user = cred.user
  const email = (user.email || '').toLowerCase()
  const isEdu = email.endsWith('.edu')

  // Only write the profile if it doesn't exist (don't clobber an existing one).
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      name:           user.displayName || email.split('@')[0] || 'Member',
      handle:         '@' + (email.split('@')[0] || 'user'),
      school:         isEdu ? schoolFromEmail(email) : '',
      bio:            '',
      avatarColor:    '#C8553D',
      avatarInitials: initialsFrom(user.displayName || email),
      rating:         5.0,
      deals:          0,
      eduVerified:    isEdu,
      localVerified:  false,
      createdAt:      serverTimestamp(),
    })
  }
  return user
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

export async function resendVerification(): Promise<void> {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser)
}

/**
 * Re-fetch user state, force-refresh ID token, and promote eduVerified→true if
 * the email is now verified and ends in .edu (mirrors iOS EmailVerification.promoteIfReady).
 */
export async function promoteEduIfReady(): Promise<void> {
  const user = auth.currentUser
  if (!user) return
  await user.reload()
  if (!user.emailVerified) return
  const email = (user.email || '').toLowerCase()
  if (!email.endsWith('.edu')) return

  await user.getIdToken(true)  // refresh token so JWT carries email_verified=true

  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  if (snap.data()?.eduVerified === true) return
  await updateDoc(ref, { eduVerified: true })
}
