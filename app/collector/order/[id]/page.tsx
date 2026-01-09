'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/common/Navbar'

export default function CollectorOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileData || profileData.role !== 'collector') {
        router.push('/')
        return
      }

      setUser(currentUser)
      setProfile(profileData)

      // Загружаем заказ
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (name),
          profiles!orders_user_id_fkey (full_name, phone)
        `)
        .eq('id', orderId)
        .single()

      if (orderData) {
        setOrder(orderData)
      }

      // Загружаем позиции заказа
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          dishes (name, price)
        `)
        .eq('order_id', orderId)

      if (itemsData) {
        setOrderItems(itemsData)
      }

      setLoading(false)

      // Подписка на изменения заказа
      const channel = supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            setOrder(payload.new as any)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    loadData()
  }, [orderId, router])

  const handleMarkReady = async () => {
    if (!confirm('Отметить заказ как готовый?')) return

    setUpdating(true)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: 'ready' })
      .eq('id', orderId)

    if (!error) {
      setOrder({ ...order, status: 'ready' })
    }
    setUpdating(false)
  }

  if (loading || !order || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="collector" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <a
              href="/collector/orders"
              className="text-orange-500 hover:text-orange-600 mb-4 inline-block"
            >
              ← Назад к заказам
            </a>
            <h1 className="text-3xl font-bold text-gray-900">
              Заказ #{order.id.slice(0, 8)}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-500">Ресторан</p>
                <p className="text-lg font-semibold">{order.restaurants?.name}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Клиент</p>
                <p className="font-medium">{order.profiles?.full_name || 'Не указано'}</p>
                <p className="text-sm text-gray-600">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Адрес доставки</p>
                <p className="font-medium">{order.address}</p>
              </div>
            </div>

            {order.notes && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Примечания</p>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Состав заказа:</h3>
              <div className="space-y-3">
                {orderItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.dishes?.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {item.price} ₽
                      </p>
                    </div>
                    <p className="font-semibold">{item.quantity * item.price} ₽</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-lg font-bold">Итого:</span>
                <span className="text-2xl font-bold text-orange-500">{order.total_price} ₽</span>
              </div>
            </div>
          </div>

          {order.status !== 'ready' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={handleMarkReady}
                disabled={updating}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {updating ? 'Обновление...' : 'Отметить как готовый'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

