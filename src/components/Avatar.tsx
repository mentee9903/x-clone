const COLORS = [
  'bg-sky-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-teal-600',
]

interface AvatarProps {
  displayName: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ displayName, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-xl',
  }[size]

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  const initial = displayName.charAt(0).toUpperCase()
  const color = COLORS[displayName.charCodeAt(0) % COLORS.length]

  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
    >
      {initial}
    </div>
  )
}
