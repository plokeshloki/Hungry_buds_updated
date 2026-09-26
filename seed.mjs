import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seed() {
  console.log('Seeding database...')

  // 1. Create Admin User
  console.log('Creating admin user...')
  const adminEmail = 'lokeshlokip2006@gmail.com'
  const adminPassword = 'Lokesh@admin098'
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  })

  let adminUserId = null

  if (authError) {
    if (authError.code === 'email_exists') {
      console.log('Admin user already exists. Fetching user ID...')
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
      if (!listError) {
        const existingUser = usersData.users.find(u => u.email === adminEmail)
        if (existingUser) adminUserId = existingUser.id
      }
    } else {
      console.error('Error creating admin user:', authError)
      return
    }
  } else {
    adminUserId = authData.user.id
    console.log('Admin user created with ID:', adminUserId)
  }

  if (adminUserId) {
    // Update profile role to ADMIN
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserId,
        role: 'ADMIN',
        name: 'Lokesh Admin'
      })
      
    if (profileError) {
      console.error('Error updating profile to ADMIN:', profileError)
    } else {
      console.log('Admin profile updated.')
    }
  }

  // 2. Create Hotels
  console.log('Creating hotels...')
  const hotels = [
    { name: 'Spice Garden', description: 'Authentic Indian cuisine', is_active: true },
    { name: 'Hostel Bites Kitchen', description: 'Quick and tasty meals', is_active: true }
  ]

  const { data: existingHotels, error: fetchError } = await supabase.from('hotels').select('*')
  if (fetchError) {
    console.error('Error fetching hotels:', fetchError)
    return
  }

  let hotelsData = existingHotels
  if (existingHotels.length === 0) {
    const { data: inserted, error: hotelsError } = await supabase
      .from('hotels')
      .insert(hotels)
      .select()

    if (hotelsError) {
      console.error('Error creating hotels:', hotelsError)
      return
    }
    hotelsData = inserted
  }
  console.log('Hotels created:', hotelsData.map(h => h.name))

  // 3. Create Categories and Dishes for each hotel
  for (const hotel of hotelsData) {
    console.log(`Creating categories and dishes for ${hotel.name}...`)
    
    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .insert({ hotel_id: hotel.id, name: 'Main Course' })
      .select()
      .single()

    if (catError) {
      console.error(`Error creating category for ${hotel.name}:`, catError)
      continue
    }

    const dishes = hotel.name === 'Spice Garden' 
      ? [
          { hotel_id: hotel.id, category_id: categoryData.id, name: 'Chicken Biryani', description: 'Aromatic rice with spices and chicken', price: 150, stock: 50, is_available: true },
          { hotel_id: hotel.id, category_id: categoryData.id, name: 'Paneer Tikka', description: 'Grilled cottage cheese cubes', price: 120, stock: 30, is_available: true }
        ]
      : [
          { hotel_id: hotel.id, category_id: categoryData.id, name: 'Maggi Noodles', description: 'Classic 2-minute noodles', price: 40, stock: 100, is_available: true },
          { hotel_id: hotel.id, category_id: categoryData.id, name: 'Egg Fried Rice', description: 'Street style fried rice with egg', price: 90, stock: 40, is_available: true }
        ]

    const { error: dishError } = await supabase
      .from('foods')
      .insert(dishes)

    if (dishError) {
      console.error(`Error creating dishes for ${hotel.name}:`, dishError)
    } else {
      console.log(`Created dishes for ${hotel.name}`)
    }
  }

  console.log('Seeding complete!')
}

seed().catch(console.error)
