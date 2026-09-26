import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const oldSupabase = createClient(process.env.OLD_SUPABASE_URL, process.env.OLD_SUPABASE_KEY)
const newSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function inspectOldDB() {
  console.log("Inspecting old DB...")
  const tables = ['customers', 'menu_items', 'category_buttons']
  
  for (const table of tables) {
    const { data, error } = await oldSupabase.from(table).select('*').limit(2)
    if (error) {
      console.error(`Error fetching ${table}:`, error)
    } else {
      console.log(`\n--- Schema for ${table} ---`)
      if (data.length > 0) {
        console.log(Object.keys(data[0]).join(', '))
        console.log("Sample:", JSON.stringify(data[0], null, 2))
      } else {
        console.log("Empty table.")
      }
    }
  }
}

inspectOldDB()
