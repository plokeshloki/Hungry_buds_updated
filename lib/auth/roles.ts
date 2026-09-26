import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function isAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { authorized: false, user: null }
    }

    // Bypass RLS infinite recursion when checking roles
    const supabaseAdmin = createAdminClient()

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error("Admin check profile error:", profileError)
    }

    const authorized = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

    return { authorized, user }
  } catch (error) {
    return { authorized: false, user: null }
  }
}
