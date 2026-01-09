import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { DishesManagement } from '@/components/admin/DishesManagement'

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <a href="/admin/restaurants" className="text-orange-500 hover:text-orange-600 mb-2 inline-block">
              ← Назад к ресторанам
            </a>
            <h1 className="text-3xl font-bold text-gray-900">
              Блюда: {restaurant.name}
            </h1>
          </div>
          <div className="flex space-x-4">
            <a
              href={`/admin/restaurants/${id}/categories/new`}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Категория
            </a>
            <a
              href={`/admin/restaurants/${id}/dishes/new`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Блюдо
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

