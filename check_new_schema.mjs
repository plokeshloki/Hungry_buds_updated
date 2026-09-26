import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const newSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
async function check() {
  const { data, error } = await newSupabase.from('profiles').select('*').limit(1)
  console.log("Profiles schema:", data ? Object.keys(data[0]) : error)
  const { data: hotels, error: hotelsErr } = await newSupabase.from('hotels').select('*')
  console.log("Hotels:", hotels.map(h => ({id: h.id, name: h.name})))
}
check()
