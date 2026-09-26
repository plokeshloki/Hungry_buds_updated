import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const newSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
async function check() {
  const { data, error } = await newSupabase.from('foods').select('id')
  console.log("Foods count in new DB:", data ? data.length : error)
}
check()
