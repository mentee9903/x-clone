'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/likes'
import { HeartIcon } from './Icons'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setCount(newLiked ? count + 1 : count - 1)

    startTransition(async () => {
      await toggleLike(postId, liked)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm transition-colors group ${
        liked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-500'
      }`}
    >
      <HeartIcon className="h-4 w-4" filled={liked} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
