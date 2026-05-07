import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { FollowButton } from '@/components/FollowButton'
import type { PostWithMeta, Profile } from '@/lib/types'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
  ])

  let isFollowing = false
  if (user && user.id !== profile.id) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!data
  }

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, reply_to_id, created_at, profiles!posts_user_id_fkey(id, username, display_name, avatar_url), likes(count)'
    )
    .eq('user_id', profile.id)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const postIds = rawPosts?.map((p) => p.id) ?? []

  const [{ data: userLikes }, { data: repliesData }] = await Promise.all([
    user && postIds.length > 0
      ? supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length > 0
      ? supabase.from('posts').select('reply_to_id').in('reply_to_id', postIds)
      : Promise.resolve({ data: [] }),
  ])

  const likedSet = new Set(userLikes?.map((l) => l.post_id) ?? [])

  const replyCountMap: Record<string, number> = {}
  repliesData?.forEach((r) => {
    if (r.reply_to_id) replyCountMap[r.reply_to_id] = (replyCountMap[r.reply_to_id] ?? 0) + 1
  })

  const posts: PostWithMeta[] = (rawPosts ?? []).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    content: p.content,
    reply_to_id: p.reply_to_id,
    created_at: p.created_at,
    profiles: p.profiles as unknown as Profile,
    likes_count: Number((p.likes as unknown as [{ count: number }])?.[0]?.count ?? 0),
    replies_count: replyCountMap[p.id] ?? 0,
    liked_by_user: likedSet.has(p.id),
  }))

  const isOwnProfile = user?.id === profile.id

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">{profile.display_name}</h1>
          <p className="text-sm text-zinc-500">{posts.length}件のポスト</p>
        </div>
      </header>

      <div className="p-4 border-b border-zinc-800">
        <div className="flex justify-between items-start mb-4">
          <Avatar displayName={profile.display_name} avatarUrl={profile.avatar_url} size="lg" />
          {!isOwnProfile && user && (
            <FollowButton targetUserId={profile.id} initialIsFollowing={isFollowing} />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
          <p className="text-zinc-500">@{profile.username}</p>
          {profile.bio && <p className="text-white mt-2">{profile.bio}</p>}
          <div className="flex gap-5 mt-3 text-sm">
            <span>
              <span className="font-bold text-white">{followingCount ?? 0}</span>
              <span className="text-zinc-500 ml-1">フォロー中</span>
            </span>
            <span>
              <span className="font-bold text-white">{followersCount ?? 0}</span>
              <span className="text-zinc-500 ml-1">フォロワー</span>
            </span>
          </div>
        </div>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {posts.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-zinc-500">まだポストがありません</p>
        </div>
      )}
    </div>
  )
}
