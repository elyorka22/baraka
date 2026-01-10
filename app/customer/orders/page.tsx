'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/common/LogoutButton'

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Загружаем заказы пользователя
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (name),
          order_items (
            *,
            dishes (name, price)
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (ordersData) {
        setOrders(ordersData)
      }

      setLoading(false)

      // Подписка на изменения заказов через Realtime
      const channel = supabase
        .channel('customer-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${currentUser.id}`,
          },
          (payload) => {
            console.log('Order change:', payload)
            // Перезагружаем заказы
            loadOrders()
          }
        )
        .subscribe()

      const loadOrders = async () => {
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            restaurants (name),
            order_items (
              *,
              dishes (name, price)
            )
          `)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
        
        if (ordersData) {
          setOrders(ordersData)
        }
      }

      return () => {
        supabase.removeChannel(channel)
      }
    }

    loadData()
  }, [router])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Qayta ishlash kutilmoqda',
      assigned_to_collector: 'Yig\'uvchiga tayinlangan',
      collecting: 'Yig\'ilmoqda',
      ready: 'Yetkazib berishga tayyor',
      assigned_to_courier: 'Kuryerga tayinlangan',
      delivering: 'Yetkazilmoqda',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilindi',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned_to_collector':
      case 'collecting': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'assigned_to_courier':
      case 'delivering': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/customer" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
            <div className="flex space-x-4 items-center">
              <Link
                href="/customer"
                className="text-gray-700 hover:text-orange-500"
              >
                Menyu
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mening buyurtmalarim</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">Hozircha buyurtmalaringiz yo'q</p>
            <Link
              href="/customer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Restoranlarga o'tish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Buyurtma #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.restaurants?.name} • {new Date(order.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Yetkazib berish manzili</p>
                  <p className="text-sm font-medium">{order.address}</p>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Buyurtma tarkibi:</h4>
                  <div className="space-y-1">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.dishes?.name} × {item.quantity}</span>
                        <span>{item.price * item.quantity} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Jami: {order.total_price} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

