import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { WarehouseTabs } from '@/components/warehouse/WarehouseTabs'

// Кешируем страницу на 30 секунд для улучшения производительности
export const revalidate = 30

export default async function WarehousePage({
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
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/')
  }

  // Загружаем склад (только необходимые поля)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, description, address, phone, image_url, is_active, manager_id, telegram_chat_id, created_at')
    .eq('id', id)
    .single()

  if (!restaurant) {
    redirect('/admin/restaurants')
  }

  // Проверяем доступ: супер-админ или менеджер этого склада
  const isSuperAdmin = profile.role === 'super_admin'
  const isManagerOfThisWarehouse = profile.role === 'manager' && restaurant.manager_id === user.id

  if (!isSuperAdmin && !isManagerOfThisWarehouse) {
    redirect('/')
  }

  // Загружаем данные для вкладок с оптимизацией запросов
  // Загружаем только необходимые поля и ограничиваем количество записей
  const [ordersResult, dishesResult, collectorsResult, couriersResult, categoriesResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total_price, address, phone, notes, created_at, updated_at, order_items(id, quantity, price, dishes(name))')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false })
      .limit(30), // Уменьшили лимит для быстрой загрузки
    supabase
      .from('dishes')
      .select('id, name, description, price, image_url, is_available, badge_text, global_category_id, created_at, global_categories(id, name)')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false })
      .limit(100), // Добавили лимит для товаров
    supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'collector')
      .eq('is_active', true)
      .limit(50), // Добавили лимит
    supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'courier')
      .eq('is_active', true)
      .limit(50), // Добавили лимит
    supabase
      .from('global_categories')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name')
      .limit(20), // Добавили лимит для категорий
  ])

  const orders = ordersResult.data || []
  const dishes = dishesResult.data || []
  const collectors = collectorsResult.data || []
  const couriers = couriersResult.data || []
  const categories = categoriesResult.data || []

  // Подсчитываем статистику из загруженных данных (быстрее чем отдельные запросы)
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    readyOrders: orders.filter(o => o.status === 'ready').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalDishes: dishes.length,
    availableDishes: dishes.filter(d => d.is_available).length,
    totalRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_price), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={profile.role} userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          {isSuperAdmin ? (
            <a 
              href="/admin/restaurants" 
              className="text-gray-900 hover:text-gray-700 mb-3 md:mb-4 inline-flex items-center gap-2 text-sm md:text-base font-medium transition-colors"
            >
              <span>←</span> Omborlarga qaytish
            </a>
          ) : (
            <a 
              href="/manager/dashboard" 
              className="text-gray-900 hover:text-gray-700 mb-3 md:mb-4 inline-flex items-center gap-2 text-sm md:text-base font-medium transition-colors"
            >
              <span>←</span> Boshqaruv paneliga qaytish
            </a>
          )}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Ombor boshqaruvi
          </p>
        </div>

        <WarehouseTabs 
          restaurant={restaurant}
          orders={orders}
          dishes={dishes}
          collectors={collectors}
          couriers={couriers}
          categories={categories}
          stats={stats}
          isSuperAdmin={isSuperAdmin}
        />
      </div>
    </div>
  )
}

