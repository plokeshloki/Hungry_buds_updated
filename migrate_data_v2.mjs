import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const oldSupabase = createClient(process.env.OLD_SUPABASE_URL, process.env.OLD_SUPABASE_KEY)
const newSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function migrate() {
  console.log("Starting migration...")

  // 1. Get the default hotel in the new DB to assign foods to
  const { data: hotels, error: hotelsErr } = await newSupabase.from('hotels').select('*').limit(1)
  if (hotelsErr || !hotels.length) {
    console.error("No hotels found in new DB to assign foods to!")
    return
  }
  const defaultHotelId = hotels[0].id
  console.log(`Using default hotel ID: ${defaultHotelId}`)

  // 2. Fetch categories from old DB
  const { data: oldCategories, error: oldCatErr } = await oldSupabase.from('category_buttons').select('*')
  if (oldCatErr) {
    console.error("Error fetching old categories:", oldCatErr)
    return
  }
  console.log(`Found ${oldCategories.length} categories in old DB.`)

  // 3. Insert categories into new DB
  const newCategoriesMap = {} // map old category_value to new category ID
  for (const oldCat of oldCategories) {
    const { data: newCat, error: newCatErr } = await newSupabase.from('categories').insert({
      hotel_id: defaultHotelId,
      name: oldCat.label
    }).select().single()

    if (newCatErr) {
      console.error(`Error inserting category ${oldCat.label}:`, newCatErr)
    } else {
      newCategoriesMap[oldCat.category_value] = newCat.id
    }
  }

  // 4. Fetch menu_items from old DB
  const { data: oldItems, error: oldItemsErr } = await oldSupabase.from('menu_items').select('*')
  if (oldItemsErr) {
    console.error("Error fetching old menu items:", oldItemsErr)
    return
  }
  console.log(`Found ${oldItems.length} menu items in old DB.`)

  // 5. Insert menu items into new DB `foods`
  let foodsInserted = 0
  for (const item of oldItems) {
    const categoryId = newCategoriesMap[item.category] || null
    
    const { error: insertErr } = await newSupabase.from('foods').insert({
      hotel_id: defaultHotelId,
      category_id: categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.photo_url,
      is_available: item.in_stock,
      stock: 999, // default
    })

    if (insertErr) {
      console.error(`Error inserting food ${item.name}:`, insertErr)
    } else {
      foodsInserted++
    }
  }
  console.log(`Successfully migrated ${foodsInserted} food items!`)

  // 6. Customers -> Profiles (Best effort)
  const { data: oldCustomers, error: oldCustErr } = await oldSupabase.from('customers').select('*')
  if (oldCustErr) {
    console.error("Error fetching old customers:", oldCustErr)
  } else {
    console.log(`Found ${oldCustomers.length} customers in old DB. Migrating to profiles...`)
    let custInserted = 0
    let custFailed = 0
    for (const cust of oldCustomers) {
      // First create auth user if possible
      const email = `customer_${cust.phone}@example.com` // mock email since old DB only has phone
      const { data: authData, error: authErr } = await newSupabase.auth.admin.createUser({
        email: email,
        password: 'password123',
        email_confirm: true
      })
      
      if (authErr) {
        // user might exist
        custFailed++
        continue
      }
      
      const { error: profErr } = await newSupabase.from('profiles').insert({
        id: authData.user.id, // Must match auth user
        name: cust.name,
        phone: cust.phone,
        hostel: cust.college_name,
        role: 'CUSTOMER'
      })
      
      if (profErr) {
        console.error(`Error inserting profile for ${cust.name}:`, profErr)
        custFailed++
      } else {
        custInserted++
      }
    }
    console.log(`Successfully migrated ${custInserted} profiles (${custFailed} failed/skipped).`)
  }
  
  console.log("Migration complete!")
}

migrate()
