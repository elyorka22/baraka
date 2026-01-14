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
      {/* Фильтры с горизонтальной прокруткой на мобильных */}
      <div className="mb-4 md:mb-6 overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
        <div className="flex space-x-2 min-w-max md:min-w-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'pending' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Kutilmoqda
          </button>
          <button
            onClick={() => setFilter('collecting')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'collecting' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Yig'ilmoqda
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'ready' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tayyor
          </button>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 md:mb-4 gap-2">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  Buyurtma #{order.id.slice(0, 8)}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {order.restaurants?.name} • {new Date(order.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium self-start ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Mijoz</p>
                <p className="text-sm md:text-base font-medium text-gray-900">{order.profiles?.full_name || 'Ko\'rsatilmagan'}</p>
                <a href={`tel:${order.phone}`} className="text-xs md:text-sm text-gray-600 hover:text-blue-600">
                  {order.phone}
                </a>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Manzil</p>
                <p className="text-sm md:text-base font-medium text-gray-900 break-words">{order.address}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pt-3 border-t border-gray-200">
              <p className="text-base md:text-lg font-bold text-gray-900">
                {Number(order.total_price).toLocaleString('ru-RU')} so'm
              </p>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      loadCollectors()
                      setShowAssignModal(order.id)
                    }}
                    className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
                  >
                    Yig'uvchini tayinlash
                  </button>
                )}
                <button
                  onClick={() => router.push(`/manager/orders/${order.id}`)}
                  className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
                >
                  Batafsil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] flex flex-col">
            <h3 className="text-lg md:text-xl font-bold mb-4">Yig'uvchini tayinlash</h3>
            <div className="flex-1 overflow-y-auto">
              <p className="mb-3 text-sm text-gray-600">Yig'uvchini tanlang:</p>
              <div className="space-y-2">
                {collectors.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Yig'uvchilar topilmadi</p>
                ) : (
                  collectors.map((collector) => (
                    <button
                      key={collector.id}
                      onClick={() => handleAssignCollector(showAssignModal, collector.id)}
                      disabled={assigning === showAssignModal}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <p className="font-medium text-gray-900">{collector.full_name || 'Ism ko\'rsatilmagan'}</p>
                      {collector.phone && (
                        <p className="text-sm text-gray-500">{collector.phone}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAssignModal(null)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

