import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Avatar } from './Avatar'
import { XLogo, HomeIcon, UserIcon, LogoutIcon } from './Icons'

export async function Sidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (
    <aside className="sticky top-0 h-screen flex flex-col py-2 w-16 xl:w-64 shrink-0">
      <Link href="/" className="p-3 mb-1 rounded-full hover:bg-zinc-900 transition-colors w-fit">
        <XLogo className="h-7 w-7 text-white" />
      </Link>

      <nav className="flex-1 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-4 p-3 rounded-full hover:bg-zinc-900 transition-colors text-white text-xl w-fit xl:w-full"
        >
          <HomeIcon className="h-6 w-6 shrink-0" />
          <span className="hidden xl:block font-medium">ホーム</span>
        </Link>
        {profile && (
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-4 p-3 rounded-full hover:bg-zinc-900 transition-colors text-white text-xl w-fit xl:w-full"
          >
            <UserIcon className="h-6 w-6 shrink-0" />
            <span className="hidden xl:block font-medium">プロフィール</span>
          </Link>
        )}
      </nav>

      {profile && (
        <div className="mt-auto">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 p-3 rounded-full hover:bg-zinc-900 transition-colors w-full"
            >
              <Avatar
                displayName={profile.display_name}
                avatarUrl={profile.avatar_url}
                size="sm"
              />
              <div className="hidden xl:flex flex-1 min-w-0 flex-col text-left">
                <span className="text-white text-sm font-bold truncate">{profile.display_name}</span>
                <span className="text-zinc-500 text-xs truncate">@{profile.username}</span>
              </div>
              <LogoutIcon className="hidden xl:block h-5 w-5 text-zinc-500 shrink-0" />
            </button>
          </form>
        </div>
      )}
    </aside>
  )
}
