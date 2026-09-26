import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
// Use Anon Key to simulate normal user access (with RLS)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function testFoodsAccess() {
  const { data, error } = await supabase.from('foods').select('*').limit(5)
  console.log("Anon RLS Foods:", data ? data.length + ' items' : error)
}
testFoodsAccess()
