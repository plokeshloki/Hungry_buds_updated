import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function checkFoods() {
  const { data, error } = await supabase.from('foods').select('*').ilike('name', '%Fry Biryani%')
  console.log("Found Fry Biryanis:", data ? data.length : error)
  if (data && data.length > 0) {
    console.log("Sample ID:", data[0].id)
  }
}
checkFoods()
