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
  const [warehousesCount, ordersCount, usersCount, bannersCount, productsCount] = await Promise.all([
    supabase.from('restaurants').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('banners').select('id', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
    supabase.from('dishes').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Панель управления
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">🏪</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Склады</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {warehousesCount.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-100 rounded-full p-3">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Продукты</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {productsCount.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">🛒</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Заказы</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {ordersCount.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Пользователи</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {usersCount.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Баннеры</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {bannersCount?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <a
                href="/admin/restaurants"
                className="block w-full text-left px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                🏪 Управление складами
              </a>
              <a
                href="/admin/products"
                className="block w-full text-left px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                📦 Управление продуктами
              </a>
              <a
                href="/admin/banners"
                className="block w-full text-left px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
              >
                🎯 Управление баннерами
              </a>
              <a
                href="/admin/users"
                className="block w-full text-left px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                👥 Управление пользователями
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

