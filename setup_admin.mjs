import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function setupAdmin() {
  const email = 'lokeshlokip2006@gmail.com'
  const password = 'Lokesh@admin098'
  
  console.log('Creating user in auth.users...')
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  })

  if (authErr) {
    if (authErr.code === 'email_exists') {
      console.log('User already exists, fetching their ID...')
      const { data: users, error: getErr } = await supabase.auth.admin.listUsers()
      const user = users.users.find(u => u.email === email)
      if (user) {
        console.log('Updating user password...')
        await supabase.auth.admin.updateUserById(user.id, { password: password })
        await setupProfile(user.id)
      } else {
        console.error('Could not find existing user.', getErr)
      }
    } else {
      console.error('Failed to create auth user:', authErr)
    }
  } else {
    console.log('User created successfully.')
    await setupProfile(authData.user.id)
  }
}

async function setupProfile(userId) {
  console.log('Upserting ADMIN profile...')
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    name: 'Lokesh Admin',
    role: 'ADMIN'
  })

  if (profErr) {
    console.error('Error creating profile:', profErr)
  } else {
    console.log('Admin profile successfully configured!')
  }
}

setupAdmin()
