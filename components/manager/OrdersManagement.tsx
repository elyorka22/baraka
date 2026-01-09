'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  status: string
  total_price: number
  address: string
  phone: string
  created_at: string
  restaurants: { name: string } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

interface OrdersManagementProps {
  orders: Order[]
}

export function OrdersManagement({ orders: initialOrders }: OrdersManagementProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<string>('all')
  const [assigning, setAssigning] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)
  const [collectors, setCollectors] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned_to_collector': return 'bg-blue-100 text-blue-800'
      case 'collecting': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'assigned_to_courier': return 'bg-indigo-100 text-indigo-800'
      case 'delivering': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      assigned_to_collector: 'Назначен сборщику',
      collecting: 'Собирается',
      ready: 'Готов',
      assigned_to_courier: 'Назначен курьеру',
      delivering: 'Доставляется',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    }
    return labels[status] || status
  }

  const loadCollectorsAndCouriers = async () => {
    const supabase = createSupabaseClient()
    const [collectorsResult, couriersResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'collector').eq('is_active', true),
      supabase.from('profiles').select('*').eq('role', 'courier').eq('is_active', true),
    ])
    if (collectorsResult.data) setCollectors(collectorsResult.data)
    if (couriersResult.data) setCouriers(couriersResult.data)
  }

  const handleAssignCollector = async (orderId: string, collectorId: string) => {
    setAssigning(orderId)
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Создаем назначение
    const { error: assignError } = await supabase
      .from('order_assignments')
      .insert([{
        order_id: orderId,
        collector_id: collectorId,
        assigned_by: user.id,
        status: 'assigned',
      }])

    if (!assignError) {
      // Обновляем статус заказа
      await supabase
        .from('orders')
        .update({ status: 'assigned_to_collector' })
        .eq('id', orderId)

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'assigned_to_collector' } : o
      ))
    }

    setAssigning(null)
    setShowAssignModal(null)
  }

  const handleAssignCourier = async (orderId: string, courierId: string) => {
    setAssigning(orderId)
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Обновляем или создаем назначение
    const { data: existing } = await supabase
      .from('order_assignments')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existing) {
      await supabase
        .from('order_assignments')
        .update({ courier_id: courierId })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('order_assignments')
        .insert([{
          order_id: orderId,
          courier_id: courierId,
          assigned_by: user.id,
          status: 'assigned',
        }])
    }

    // Обновляем статус заказа
    await supabase
      .from('orders')
      .update({ status: 'assigned_to_courier' })
      .eq('id', orderId)

    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: 'assigned_to_courier' } : o
    ))

    setAssigning(null)
    setShowAssignModal(null)
  }

  return (
    <div>
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Все
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Ожидают
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-lg ${filter === 'ready' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Готовы
        </button>
        <button
          onClick={() => setFilter('delivering')}
          className={`px-4 py-2 rounded-lg ${filter === 'delivering' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          В доставке
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Заказ #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.restaurants?.name} • {new Date(order.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Клиент</p>
                <p className="text-sm font-medium">{order.profiles?.full_name || 'Не указано'}</p>
                <p className="text-sm text-gray-600">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Адрес</p>
                <p className="text-sm font-medium">{order.address}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-gray-900">
                {order.total_price} ₽
              </p>
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      loadCollectorsAndCouriers()
                      setShowAssignModal(order.id)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Назначить сборщика
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => {
                      loadCollectorsAndCouriers()
                      setShowAssignModal(order.id)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Назначить курьера
                  </button>
                )}
                <button
                  onClick={() => router.push(`/manager/orders/${order.id}`)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Назначить сотрудника</h3>
            {orders.find(o => o.id === showAssignModal)?.status === 'pending' ? (
              <div>
                <p className="mb-3 text-sm text-gray-600">Выберите сборщика:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collectors.map((collector) => (
                    <button
                      key={collector.id}
                      onClick={() => handleAssignCollector(showAssignModal, collector.id)}
                      disabled={assigning === showAssignModal}
                      className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      {collector.full_name || collector.id.slice(0, 8)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3 text-sm text-gray-600">Выберите курьера:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {couriers.map((courier) => (
                    <button
                      key={courier.id}
                      onClick={() => handleAssignCourier(showAssignModal, courier.id)}
                      disabled={assigning === showAssignModal}
                      className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      {courier.full_name || courier.id.slice(0, 8)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setShowAssignModal(null)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

