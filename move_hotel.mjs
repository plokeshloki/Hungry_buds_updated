import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function moveAndRename() {
  const spiceGardenId = '92304654-a9af-4796-9705-af75881314f0'
  const hostelBitesId = '05d55567-0a2e-4687-80a6-644a48f94574'

  console.log("Moving categories...")
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .update({ hotel_id: hostelBitesId })
    .eq('hotel_id', spiceGardenId)
  if (catErr) console.error("Error moving categories:", catErr)
  
  console.log("Moving foods...")
  const { data: foodData, error: foodErr } = await supabase
    .from('foods')
    .update({ hotel_id: hostelBitesId })
    .eq('hotel_id', spiceGardenId)
  if (foodErr) console.error("Error moving foods:", foodErr)

  console.log("Renaming Hostel Bites Kitchen to Hungry Buds...")
  const { error: hotelErr } = await supabase
    .from('hotels')
    .update({ name: 'Hungry Buds', is_active: true })
    .eq('id', hostelBitesId)
  if (hotelErr) console.error("Error renaming hotel:", hotelErr)
  
  // Also deactivate Spice Garden just in case
  await supabase
    .from('hotels')
    .update({ is_active: false })
    .eq('id', spiceGardenId)

  console.log("Done!")
}

moveAndRename()
