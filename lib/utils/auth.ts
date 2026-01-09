import { createSupabaseClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/database.types'

export async function getCurrentUser() {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile ? { ...user, profile } : null
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser()
  return user?.profile?.role || null
}

export function getRoleRedirectPath(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard'
    case 'manager':
      return '/manager/dashboard'
    case 'collector':
      return '/collector/orders'
    case 'courier':
      return '/courier/orders'
    case 'customer':
      return '/'
    default:
      return '/auth/login'
  }
}

