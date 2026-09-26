import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
async function check() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', '96a27492-a7c9-4345-a2f9-775b528e0ca7').single()
  console.log("Profile data:", data ? data : error)
}
check()
