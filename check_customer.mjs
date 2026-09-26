import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function checkUser() {
  const email = 'onlineorder133@gmail.com'
  
  // Find in auth.users
  let foundUser = null
  let page = 1
  while (true) {
    const { data: users, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error || users.users.length === 0) break
    
    foundUser = users.users.find(u => u.email === email)
    if (foundUser) break
    page++
  }
  
  if (foundUser) {
    console.log("Auth User:", {
      id: foundUser.id,
      email: foundUser.email,
      confirmed_at: foundUser.email_confirmed_at,
      created_at: foundUser.created_at
    })
    
    // Check Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', foundUser.id).single()
    console.log("Profile:", profile || "Not found!")
  } else {
    console.log("User not found in auth.users.")
  }
}

checkUser()
