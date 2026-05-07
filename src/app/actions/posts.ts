'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const content = (formData.get('content') as string).trim()
  const replyToId = (formData.get('reply_to_id') as string) || null

  if (!content || content.length > 280) return { error: '無効なテキストです' }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    content,
    reply_to_id: replyToId,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}
