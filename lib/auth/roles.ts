import { createClient } from '@/lib/supabase/server'

export async function isAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { authorized: false, user: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const authorized = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

    return { authorized, user }
  } catch (error) {
    return { authorized: false, user: null }
  }
}
