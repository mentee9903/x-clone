'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'メールアドレスまたはパスワードが正しくありません' }

  redirect('/')
}

export async function register(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = (formData.get('username') as string).toLowerCase().trim()
  const displayName = (formData.get('display_name') as string).trim()

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: 'ユーザー名は3〜20文字の英数字とアンダースコアのみ使用できます' }
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle()

  if (existing) return { error: 'このユーザー名は既に使用されています' }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName } },
  })

  if (error) return { error: error.message }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
