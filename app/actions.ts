'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function customerLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) redirect('/login?error=MissingCredentials')
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=InvalidCredentials')
  
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single()
  
  if (profile?.role !== 'CUSTOMER') {
    await supabase.auth.signOut()
    redirect('/login?error=WrongPortal')
  }
  
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) redirect('/admin/login?error=MissingCredentials')
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/admin/login?error=InvalidCredentials')
  
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single()
  
  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN') {
    await supabase.auth.signOut()
    redirect('/admin/login?error=WrongPortal')
  }
  
  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}

export async function deliveryLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) redirect('/delivery/login?error=MissingCredentials')
  
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/delivery/login?error=InvalidCredentials')
  
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single()
  
  if (profile?.role !== 'DELIVERY') {
    await supabase.auth.signOut()
    redirect('/delivery/login?error=WrongPortal')
  }
  
  revalidatePath('/', 'layout')
  redirect('/delivery')
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const hostel = formData.get('hostel') as string
  const room_number = formData.get('room_number') as string

  if (!email || !password || !name) {
    redirect('/register?error=MissingFields')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        hostel,
        room_number,
      }
    }
  })

  if (error) {
    redirect('/register?error=RegistrationFailed')
  }

  // Next.js Supabase Auth automatically triggers a postgres trigger to insert into profiles 
  // OR we can do it manually here. The user requested we use Supabase Auth and RLS. 
  // Let's insert the profile manually since we have a custom `profiles` table and need to pass extra metadata,
  // unless we use a Postgres trigger. Given we don't have a trigger in the migration, we'll insert it manually using the service role or authenticated user.
  // Actually, since RLS on profiles allows users to insert their own profile, we can insert it here.
  
  if (data.user) {
    // We use the admin client because regular users do not have INSERT permissions on profiles table
    // (RLS policies only allow SELECT/UPDATE for users). 
    // This securely creates the profile backend-side upon successful registration.
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabaseAdmin = createAdminClient()

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: data.user.id,
      name,
      phone,
      hostel,
      room_number,
      role: 'CUSTOMER'
    })
    
    if (profileError) {
      console.error('Failed to create profile:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
