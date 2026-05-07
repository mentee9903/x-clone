'use client'

import { useActionState, useRef, useState } from 'react'
import { createPost } from '@/app/actions/posts'
import { Avatar } from './Avatar'

interface PostFormProps {
  displayName: string
  avatarUrl?: string | null
  replyToId?: string
  placeholder?: string
}

export function PostForm({
  displayName,
  avatarUrl,
  replyToId,
  placeholder = '今、何が起きてる？',
}: PostFormProps) {
  const [state, formAction, isPending] = useActionState(createPost, {})
  const [content, setContent] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const remaining = 280 - content.length
  const canSubmit = content.trim().length > 0 && remaining >= 0

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => setContent('')}
      className="flex gap-3 p-4 border-b border-zinc-800"
    >
      <Avatar displayName={displayName} avatarUrl={avatarUrl} size="md" />
      <div className="flex-1">
        {replyToId && <input type="hidden" name="reply_to_id" value={replyToId} />}
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent text-white text-lg placeholder-zinc-600 resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <span
            className={`text-sm ${
              remaining < 20
                ? remaining < 0
                  ? 'text-red-500'
                  : 'text-yellow-500'
                : 'text-zinc-500'
            }`}
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-full text-sm transition-colors"
          >
            {isPending ? '投稿中...' : 'ポスト'}
          </button>
        </div>
        {state?.error && <p className="text-red-400 text-sm mt-1">{state.error}</p>}
      </div>
    </form>
  )
}
