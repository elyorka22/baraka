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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

        {/* Ссылка на управление складом */}
        {managerWarehouse && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ombor boshqaruvi</h2>
            <a
              href={`/warehouse/${managerWarehouse.id}`}
              className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {managerWarehouse.name} - Ombor boshqaruvi
            </a>
            <p className="text-sm text-gray-600 mt-2">
              Bu yerdan ombor statistikasi, buyurtmalar, mahsulotlar va tayinlashlarni boshqarishingiz mumkin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

