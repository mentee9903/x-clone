'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { XLogo } from '@/components/Icons'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, { error: null })

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <XLogo className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-8 text-center">アカウント作成</h1>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {state.error}
            </div>
          )}
          <input
            name="display_name"
            type="text"
            placeholder="表示名"
            required
            maxLength={50}
            autoComplete="name"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <div>
            <input
              name="username"
              type="text"
              placeholder="ユーザー名（英数字・アンダースコア）"
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              maxLength={20}
              autoComplete="username"
              className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <p className="text-zinc-600 text-xs mt-1 px-1">3〜20文字、英数字とアンダースコアのみ</p>
          </div>
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
            placeholder="パスワード（8文字以上）"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-bold py-3 rounded-full transition-colors"
          >
            {isPending ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="text-sky-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
