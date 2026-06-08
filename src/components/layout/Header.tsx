"use client";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import { useUserGold } from "@/features/economy/hooks/useUserGold";
import Image from "next/image";

interface HeaderProps {
  onLeaderboardClick?: () => void;
  onMenuClick?: () => void;
}

export function Header({ onLeaderboardClick, onMenuClick }: HeaderProps) {
  const user = useCurrentUser();
  const { gold } = useUserGold(user?.uid);
  const { logout } = useSignIn();

  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Mở menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect y="2" width="16" height="2" rx="1" />
            <rect y="7" width="16" height="2" rx="1" />
            <rect y="12" width="16" height="2" rx="1" />
          </svg>
        </button>
        <span className="text-white font-bold tracking-tight">WorldCity</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Gold */}
        <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 md:px-3 py-1 rounded-full">
          <span className="text-yellow-400 text-sm">🪙</span>
          <span className="text-yellow-400 font-mono text-sm font-medium">
            {gold.toLocaleString()}
          </span>
        </div>

        {/* Leaderboard */}
        <button
          onClick={onLeaderboardClick}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 px-2.5 md:px-3 py-1 rounded-full transition-colors"
          title="Bảng xếp hạng"
        >
          <span className="text-sm">🏆</span>
          <span className="text-slate-300 text-xs hidden sm:block">BXH</span>
        </button>

        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? ""}
                width={28}
                height={28}
                className="rounded-full"
              />
            )}
            <span className="text-slate-300 text-sm hidden md:block">
              {user.displayName}
            </span>
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
  );
}
