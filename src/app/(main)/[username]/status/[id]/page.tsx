import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { LikeButton } from '@/components/LikeButton'
import { ChatBubbleIcon } from '@/components/Icons'
import { PostCard } from '@/components/PostCard'
import { PostForm } from '@/components/PostForm'
import type { PostWithMeta, Profile } from '@/lib/types'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>
}) {
  const { username, id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawPost } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, reply_to_id, created_at, profiles!posts_user_id_fkey(id, username, display_name, avatar_url), likes(count)'
    )
    .eq('id', id)
    .single()

  const postProfile = rawPost?.profiles as unknown as Profile | null
  if (!rawPost || postProfile?.username !== username) notFound()

  const { data: rawReplies } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, reply_to_id, created_at, profiles!posts_user_id_fkey(id, username, display_name, avatar_url), likes(count)'
    )
    .eq('reply_to_id', id)
    .order('created_at', { ascending: true })
    .limit(50)

  const replyIds = rawReplies?.map((r) => r.id) ?? []

  const [{ data: likedPost }, { data: userLikesReplies }, currentProfile] = await Promise.all([
    user
      ? supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('post_id', id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user && replyIds.length > 0
      ? supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', replyIds)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('profiles').select('*').eq('id', user.id).single().then((r) => r.data)
      : Promise.resolve(null),
  ])

  const likedRepliesSet = new Set(userLikesReplies?.map((l) => l.post_id) ?? [])

  const profile = postProfile!
  const likesCount = Number(
    (rawPost.likes as unknown as [{ count: number }])?.[0]?.count ?? 0
  )

  const replies: PostWithMeta[] = (rawReplies ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    content: r.content,
    reply_to_id: r.reply_to_id,
    created_at: r.created_at,
    profiles: r.profiles as unknown as Profile,
    likes_count: Number((r.likes as unknown as [{ count: number }])?.[0]?.count ?? 0),
    replies_count: 0,
    liked_by_user: likedRepliesSet.has(r.id),
  }))

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">ポスト</h1>
        </div>
      </header>

      <article className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/${profile.username}`} className="shrink-0">
            <Avatar displayName={profile.display_name} avatarUrl={profile.avatar_url} />
          </Link>
          <div>
            <Link href={`/${profile.username}`} className="font-bold text-white hover:underline block">
              {profile.display_name}
            </Link>
            <p className="text-zinc-500 text-sm">@{profile.username}</p>
          </div>
        </div>

        <p className="text-white text-xl whitespace-pre-wrap break-words leading-relaxed">
          {rawPost.content}
        </p>

        <p className="text-zinc-500 text-sm mt-4">
          {new Date(rawPost.created_at).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-800 text-zinc-500">
          <div className="flex items-center gap-1.5 text-sm">
            <ChatBubbleIcon className="h-4 w-4" />
            <span>{replies.length}</span>
            <span>返信</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <LikeButton
              postId={rawPost.id}
              initialLiked={!!likedPost}
              initialCount={likesCount}
            />
            {likesCount > 0 && <span>いいね</span>}
          </div>
        </div>
      </article>

      {currentProfile && (
        <PostForm
          displayName={currentProfile.display_name}
          avatarUrl={currentProfile.avatar_url}
          replyToId={rawPost.id}
          placeholder={`@${profile.username}へ返信`}
        />
      )}

      {replies.map((reply) => (
        <PostCard key={reply.id} post={reply} />
      ))}
    </div>
  )
}
