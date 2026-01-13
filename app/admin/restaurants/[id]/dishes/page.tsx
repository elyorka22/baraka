import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { DishesManagement } from '@/components/admin/DishesManagement'

export const dynamic = 'force-dynamic'

export default async function RestaurantDishesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    redirect('/')
  }

  const [restaurantResult, categoriesResult, dishesResult] = await Promise.all([
    supabase.from('restaurants').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').eq('restaurant_id', id).order('name'),
    supabase.from('dishes').select('*, categories(*)').eq('restaurant_id', id).order('created_at', { ascending: false }),
  ])

  const restaurant = restaurantResult.data
  const categories = categoriesResult.data || []
  const dishes = dishesResult.data || []

  if (!restaurant) {
    redirect('/admin/restaurants')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <a href="/admin/restaurants" className="text-gray-900 hover:text-gray-700 mb-2 inline-flex items-center gap-2 font-medium transition-colors">
              <span>←</span> Omborlarga qaytish
            </a>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Mahsulotlar: {restaurant.name}
            </h1>
            <p className="text-gray-600">Ombor mahsulotlarini boshqaring</p>
          </div>
          <div className="flex space-x-4">
            <a
              href={`/admin/restaurants/${id}/categories/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <span>+</span>
              <span>Kategoriya</span>
            </a>
            <a
              href={`/admin/restaurants/${id}/dishes/new`}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2"
            >
              <span>+</span>
              <span>Mahsulot</span>
            </a>
          </div>
        </div>

        <DishesManagement 
          restaurantId={id}
          categories={categories}
          dishes={dishes}
        />
      </div>
    </div>
  )
}

