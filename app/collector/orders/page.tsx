import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'

export default async function CollectorOrdersPage() {
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

  if (!profile || profile.role !== 'collector') {
    redirect('/')
  }

  // Получаем назначенные заказы
  const { data: assignments } = await supabase
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
    .eq('collector_id', user.id)
    .order('assigned_at', { ascending: false })

  const assignedOrders = assignments?.map(a => a.orders).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="collector" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Мои заказы
        </h1>

        {assignedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              У вас пока нет назначенных заказов
            </p>
          </div>
        ) : (
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'collecting' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status === 'ready' ? 'Готов' :
                     order.status === 'collecting' ? 'Собирается' :
                     'Назначен'}
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
                    href={`/collector/order/${order.id}`}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Подробнее
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

