export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  reply_to_id: string | null
  created_at: string
}

export interface PostWithMeta extends Post {
  profiles: Profile
  likes_count: number
  replies_count: number
  liked_by_user: boolean
}
