import { isAdmin } from './auth/roles'
import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const { authorized, user } = await isAdmin()
  if (!authorized) {
    redirect('/admin/login')
  }
  return user
}

export async function requireDeliveryOrAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/delivery/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DELIVERY'].includes(profile.role)) {
    redirect('/delivery/login')
  }

  return user
}
