'use client'

import { useAuthStore } from '../store'

export function useAuth() {
  return useAuthStore()
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user)
}
