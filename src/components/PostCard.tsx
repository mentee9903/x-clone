import Link from 'next/link'
import { Avatar } from './Avatar'
import { LikeButton } from './LikeButton'
import { ChatBubbleIcon } from './Icons'
import type { PostWithMeta } from '@/lib/types'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}日`
  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function PostCard({ post }: { post: PostWithMeta }) {
  const { profiles } = post

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-zinc-800 hover:bg-white/[0.03] transition-colors">
      <Link href={`/${profiles.username}`} className="shrink-0 self-start">
        <Avatar displayName={profiles.display_name} avatarUrl={profiles.avatar_url} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 flex-wrap">
          <Link href={`/${profiles.username}`} className="font-bold text-white hover:underline">
            {profiles.display_name}
          </Link>
          <span className="text-zinc-500 text-sm truncate">@{profiles.username}</span>
          <span className="text-zinc-500 text-sm">·</span>
          <Link
            href={`/${profiles.username}/status/${post.id}`}
            className="text-zinc-500 text-sm hover:underline shrink-0"
          >
            {timeAgo(post.created_at)}
          </Link>
        </div>
        <Link href={`/${profiles.username}/status/${post.id}`}>
          <p className="text-white mt-0.5 whitespace-pre-wrap break-words leading-normal">
            {post.content}
          </p>
        </Link>
        <div className="flex items-center gap-6 mt-2 text-zinc-500">
          <Link
            href={`/${profiles.username}/status/${post.id}`}
            className="flex items-center gap-1.5 text-sm hover:text-sky-500 transition-colors"
          >
            <ChatBubbleIcon className="h-4 w-4" />
            {post.replies_count > 0 && <span>{post.replies_count}</span>}
          </Link>
          <LikeButton
            postId={post.id}
            initialLiked={post.liked_by_user}
            initialCount={post.likes_count}
          />
        </div>
      </div>
    </article>
  )
}
