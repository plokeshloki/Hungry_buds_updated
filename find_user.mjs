import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function findUser() {
  const email = 'lokeshlokip2006@gmail.com'
  let page = 1
  let foundUser = null
  
  while (true) {
    const { data: users, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error || users.users.length === 0) break
    
    foundUser = users.users.find(u => u.email === email)
    if (foundUser) break
    page++
  }
  
  if (foundUser) {
    console.log("Found user ID:", foundUser.id)
    await supabase.auth.admin.updateUserById(foundUser.id, { password: 'Lokesh@admin098' })
    const { error } = await supabase.from('profiles').upsert({
      id: foundUser.id,
      name: 'Lokesh Admin',
      role: 'SUPER_ADMIN' // Use SUPER_ADMIN or ADMIN
    })
    console.log("Profile updated:", error ? error : "Success")
  } else {
    console.log("User not found at all.")
  }
}
findUser()
