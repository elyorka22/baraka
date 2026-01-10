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
      pending: 'Kutilmoqda',
      assigned_to_collector: 'Yig\'uvchiga tayinlangan',
      collecting: 'Yig\'ilmoqda',
      ready: 'Tayyor',
      assigned_to_courier: 'Kuryerga tayinlangan',
      delivering: 'Yetkazilmoqda',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilindi',
    }
    return labels[status] || status
  }

  const loadCollectors = async () => {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'collector')
      .eq('is_active', true)
    if (data) setCollectors(data)
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


  return (
    <div>
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Barchasi
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Kutilmoqda
        </button>
        <button
          onClick={() => setFilter('collecting')}
          className={`px-4 py-2 rounded-lg ${filter === 'collecting' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Yig'ilmoqda
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`px-4 py-2 rounded-lg ${filter === 'ready' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          Tayyor
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Buyurtma #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.restaurants?.name} • {new Date(order.created_at).toLocaleString('uz-UZ')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Mijoz</p>
                <p className="text-sm font-medium">{order.profiles?.full_name || 'Ko\'rsatilmagan'}</p>
                <p className="text-sm text-gray-600">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manzil</p>
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
                      loadCollectors()
                      setShowAssignModal(order.id)
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Yig'uvchini tayinlash
                  </button>
                )}
                <button
                  onClick={() => router.push(`/manager/orders/${order.id}`)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Batafsil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Yig'uvchini tayinlash</h3>
            <div>
              <p className="mb-3 text-sm text-gray-600">Yig'uvchini tanlang:</p>
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
            <button
              onClick={() => setShowAssignModal(null)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

