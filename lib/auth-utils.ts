import { isAdmin } from './auth/roles'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DELIVERY'].includes(profile.role)) {
    redirect('/delivery/login')
  }

  return user
}
