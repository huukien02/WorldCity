'use client'

import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { userDoc } from '@/lib/firestore'

export function useUserGold(uid: string | undefined) {
  const [gold, setGold] = useState(0)

  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(userDoc(uid), (snap) => {
      if (snap.exists()) setGold(snap.data().gold)
    })
    return unsub
  }, [uid])

  return { gold }
}
