'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/app/actions/follows'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const current = isFollowing
    setIsFollowing(!current)

    startTransition(async () => {
      await toggleFollow(targetUserId, current)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
        isFollowing
          ? 'bg-transparent border border-zinc-600 text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
          : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
