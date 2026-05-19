import { getUserProfile } from '@/lib/auth/session'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  title: string
}

export async function Header({ title }: HeaderProps) {
  const profile = await getUserProfile()

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        {profile && (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {ROLE_LABELS[profile.role]}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          {profile?.name && (
            <span className="hidden md:block text-sm font-medium">
              {profile.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
