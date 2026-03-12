"use client";

import { signOut } from "next-auth/react";

type HeaderProps = {
  user: { name?: string | null; image?: string | null } | undefined;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight">TV Command Center</h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.image && (
            <img src={user.image} alt="" className="h-7 w-7 rounded-full ring-2 ring-zinc-700" />
          )}
          <span className="text-sm text-zinc-400">{user?.name}</span>
          <button
            onClick={() => signOut()}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
