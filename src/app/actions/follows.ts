'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(targetUserId: string, isFollowing: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  if (isFollowing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  }

  revalidatePath('/', 'layout')
}
