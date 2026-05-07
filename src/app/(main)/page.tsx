import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostForm } from '@/components/PostForm'
import { PostCard } from '@/components/PostCard'
import type { PostWithMeta, Profile } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = follows?.map((f) => f.following_id) ?? []
  const userIds = [user.id, ...followingIds]

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, reply_to_id, created_at, profiles!posts_user_id_fkey(id, username, display_name, avatar_url), likes(count)'
    )
    .is('reply_to_id', null)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(50)

  const postIds = rawPosts?.map((p) => p.id) ?? []

  const [{ data: userLikes }, { data: repliesData }] = await Promise.all([
    postIds.length > 0
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

  return (
    <div>
      <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">ホーム</h1>
        </div>
      </header>

      {profile && (
        <PostForm displayName={profile.display_name} avatarUrl={profile.avatar_url} />
      )}

      <div>
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500 text-lg">ポストがありません</p>
            <p className="text-zinc-600 text-sm mt-1">
              誰かをフォローするか、最初のポストをしてみましょう！
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
