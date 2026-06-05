'use client'

import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User } from 'firebase/auth'

async function createUserIfNew(user: User) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName ?? 'Unnamed',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: serverTimestamp(),
      gold: 10000,
      landCount: 0,
      totalBuildings: 0,
      bio: '',
      lastActiveAt: serverTimestamp(),
      guildId: null,
      guildRole: null,
    })
  }
}

export function useSignIn() {
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider())
    await createUserIfNew(result.user)
  }

  async function loginWithGithub() {
    const result = await signInWithPopup(auth, new GithubAuthProvider())
    await createUserIfNew(result.user)
  }

  async function logout() {
    await signOut(auth)
  }

  return { loginWithGoogle, loginWithGithub, logout }
}
