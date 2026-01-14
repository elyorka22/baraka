import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
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

  // Получаем статистику
  const [warehousesCount, ordersCount, usersCount, productsCount] = await Promise.all([
    supabase.from('restaurants').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('dishes').select('id', { count: 'exact', head: true }),
  ])

  // Получаем количество баннеров с обработкой ошибок
  let bannersCount = { count: 0 }
  try {
    const bannersResult = await supabase.from('banners').select('id', { count: 'exact', head: true })
    if (bannersResult.count !== null) {
      bannersCount = { count: bannersResult.count }
    }
  } catch {
    bannersCount = { count: 0 }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Панель управления
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Склады</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {warehousesCount.count || 0}
              </p>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Продукты</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {productsCount.count || 0}
              </p>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Заказы</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {ordersCount.count || 0}
              </p>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Пользователи</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {usersCount.count || 0}
              </p>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Баннеры</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {bannersCount?.count || 0}
              </p>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

