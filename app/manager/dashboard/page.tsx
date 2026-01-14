import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
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

  if (!profile || (profile.role !== 'manager' && profile.role !== 'super_admin')) {
    redirect('/')
  }

  // Получаем склад менеджера (если это менеджер)
  let managerWarehouse = null
  if (profile.role === 'manager') {
    const { data: warehouse } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('manager_id', user.id)
      .single()
    managerWarehouse = warehouse
  }

  // Получаем статистику заказов
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')

  const { data: readyOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'ready')

  const { data: deliveringOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'delivering')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="manager" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Панель менеджера
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ожидают обработки</h3>
            <p className="text-3xl font-bold text-orange-500">
              {pendingOrders?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Готовы к доставке</h3>
            <p className="text-3xl font-bold text-green-500">
              {readyOrders?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">В доставке</h3>
            <p className="text-3xl font-bold text-blue-500">
              {deliveringOrders?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="space-y-3">
            {managerWarehouse && (
              <a
                href={`/warehouse/${managerWarehouse.id}`}
                className="block w-full text-left px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Ombor boshqaruvi: {managerWarehouse.name}
              </a>
            )}
            <a
              href="/manager/orders"
              className="block w-full text-left px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Управление заказами
            </a>
            <a
              href="/manager/collectors"
              className="block w-full text-left px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Управление сборщиками
            </a>
            <a
              href="/manager/couriers"
              className="block w-full text-left px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Управление курьерами
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

