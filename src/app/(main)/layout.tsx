import { Sidebar } from '@/components/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-5xl mx-auto">
      <Sidebar />
      <main className="flex-1 border-x border-zinc-800 min-h-screen">{children}</main>
    </div>
  )
}
