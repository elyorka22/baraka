import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { RestaurantTabs } from '@/components/admin/RestaurantTabs'

export const dynamic = 'force-dynamic'

export default async function RestaurantPage({
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

  // Загружаем данные склада, товаров, категорий и статистику
  const [restaurantResult, dishesResult, categoriesResult, ordersResult] = await Promise.all([
    supabase.from('restaurants').select('*').eq('id', id).single(),
    supabase.from('dishes').select('*, global_categories(id, name)').eq('restaurant_id', id).order('created_at', { ascending: false }),
    supabase.from('global_categories').select('*').eq('is_active', true).order('name'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('restaurant_id', id),
  ])

  const restaurant = restaurantResult.data
  const dishes = dishesResult.data || []
  const categories = categoriesResult.data || []
  const ordersCount = ordersResult.count || 0

  if (!restaurant) {
    redirect('/admin/restaurants')
  }

  // Статистика
  const stats = {
    totalDishes: dishes.length,
    availableDishes: dishes.filter(d => d.is_available).length,
    totalOrders: ordersCount,
    totalCategories: categories.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a 
            href="/admin/restaurants" 
            className="text-gray-900 hover:text-gray-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <span>←</span> Omborlarga qaytish
          </a>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Ombor ma'lumotlari va boshqaruvi
          </p>
        </div>

        <RestaurantTabs 
          restaurant={restaurant}
          dishes={dishes}
          categories={categories}
          stats={stats}
        />
      </div>
    </div>
  )
}
