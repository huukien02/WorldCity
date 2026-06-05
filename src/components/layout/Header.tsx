'use client'

import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { useSignIn } from '@/features/auth/hooks/useSignIn'
import { useUserGold } from '@/features/economy/hooks/useUserGold'
import Image from 'next/image'

export function Header() {
  const user = useCurrentUser()
  const { gold } = useUserGold(user?.uid)
  const { logout } = useSignIn()

  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
      <span className="text-white font-bold tracking-tight">WorldCity</span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full">
          <span className="text-yellow-400 text-sm">🪙</span>
          <span className="text-yellow-400 font-mono text-sm font-medium">{gold.toLocaleString()}</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? ''}
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <span className="text-slate-300 text-sm hidden sm:block">{user.displayName}</span>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
