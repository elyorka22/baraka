import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'

export const dynamic = 'force-dynamic'

export default async function CourierOrdersPage() {
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

  if (!profile || profile.role !== 'courier') {
    redirect('/')
  }

  // Получаем готовые заказы и назначенные заказы
  const [readyOrdersResult, assignedOrdersResult] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .eq('status', 'ready')
      .order('created_at', { ascending: false }),
    supabase
      .from('order_assignments')
      .select(`
        *,
        orders (
          id,
          status,
          total_price,
          address,
          phone,
          created_at,
          restaurants (
            name
          )
        )
      `)
      .eq('courier_id', user.id)
      .order('assigned_at', { ascending: false })
  ])

  const readyOrders = readyOrdersResult.data || []
  const assignedOrders = assignedOrdersResult.data?.map(a => a.orders).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="courier" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Доступные заказы
        </h1>

        {readyOrders.length === 0 && assignedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              Нет доступных заказов для доставки
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {assignedOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Мои заказы
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {assignedOrders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Заказ #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.restaurants?.name}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {order.status === 'delivering' ? 'Доставляется' : 'Назначен'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Адрес доставки</p>
                          <p className="text-sm font-medium">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Телефон</p>
                          <p className="text-sm font-medium">{order.phone}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          {order.total_price} ₽
                        </p>
                        <a
                          href={`/courier/order/${order.id}`}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Подробнее
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Готовы к доставке
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {readyOrders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Заказ #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.restaurants?.name}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Готов
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Адрес доставки</p>
                          <p className="text-sm font-medium">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Телефон</p>
                          <p className="text-sm font-medium">{order.phone}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-gray-900">
                          {order.total_price} ₽
                        </p>
                        <a
                          href={`/courier/order/${order.id}`}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          Принять заказ
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

