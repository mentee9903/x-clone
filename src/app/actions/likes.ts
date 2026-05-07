'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string, liked: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  if (liked) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
  } else {
    await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
  }

  revalidatePath('/', 'layout')
}
