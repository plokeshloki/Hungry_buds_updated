import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const possibleTables = [
    'hotels', 'foods', 'settings', 'profiles', 'orders', 'order_items', 'payments', 'audit_logs', // V2 schema
    'admin_users', 'app_settings', 'category_buttons', 'customers', 'menu_items', 'order_items', 'order_windows', 'orders', 'pending_orders' // V1 schema from screenshot
  ]
  
  for (const table of possibleTables) {
    const { data, error } = await supabase.from(table).select('*').limit(3)
    if (error) {
      // console.error(`Table ${table} might not exist or error:`, error.message)
    } else if (data.length > 0) {
      console.log(`\n--- Data in ${table} (${data.length} rows preview) ---`)
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log(`\n--- Table ${table} exists but is EMPTY ---`)
    }
  }
}

checkData()
