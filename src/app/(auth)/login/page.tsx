'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { XLogo } from '@/components/Icons'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: null })

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <XLogo className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-8 text-center">ログイン</h1>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            autoComplete="email"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <input
            name="password"
            type="password"
            placeholder="パスワード"
            required
            autoComplete="current-password"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-bold py-3 rounded-full transition-colors"
          >
            {isPending ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          アカウントをお持ちでないですか？{' '}
          <Link href="/register" className="text-sky-500 hover:underline">
            登録する
          </Link>
        </p>
      </div>
    </div>
  )
}
