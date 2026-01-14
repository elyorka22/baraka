'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Order {
  id: string
  user_id: string
  restaurant_id: string
  status: string
  total_price: number
  address: string
  phone: string
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: Array<{
    id: string
    dish_id: string
    quantity: number
    price: number
    dishes?: {
      name: string
      price: number
    }
  }>
}

interface WarehouseOrdersProps {
  orders: Order[]
  restaurantId: string
}

export function WarehouseOrders({ orders: initialOrders, restaurantId }: WarehouseOrdersProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      assigned_to_collector: 'Yig\'uvchiga tayinlangan',
      collecting: 'Yig\'ilmoqda',
      ready: 'Tayyor',
      assigned_to_courier: 'Kuryerga tayinlangan',
      delivering: 'Yetkazilmoqda',
      delivered: 'Yetkazildi',
      cancelled: 'Bekor qilindi',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned_to_collector: 'bg-blue-100 text-blue-800',
      collecting: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      assigned_to_courier: 'bg-indigo-100 text-indigo-800',
      delivering: 'bg-orange-100 text-orange-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      alert('Buyurtma holati yangilandi')
    } else {
      alert(`Xatolik: ${error.message}`)
    }
    setUpdating(null)
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    collecting: orders.filter(o => o.status === 'collecting' || o.status === 'assigned_to_collector').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivering: orders.filter(o => o.status === 'delivering' || o.status === 'assigned_to_courier').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Barchasi' : getStatusLabel(status)}
            <span className="ml-2">({count})</span>
          </button>
        ))}
      </div>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Buyurtmalar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Buyurtma #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500">Manzil:</p>
                <p className="text-base text-gray-900">{order.address}</p>
                <p className="text-sm text-gray-500 mt-1">Telefon:</p>
                <p className="text-base text-gray-900">{order.phone}</p>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Buyurtma tarkibi:</p>
                  <ul className="space-y-1">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600">
                        {item.dishes?.name || 'Mahsulot'} × {item.quantity} - {Number(item.price * item.quantity).toLocaleString('ru-RU')} so'm
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">
                  {Number(order.total_price).toLocaleString('ru-RU')} so'm
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={updating === order.id}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:opacity-50"
                >
                  <option value="pending">Kutilmoqda</option>
                  <option value="assigned_to_collector">Yig'uvchiga tayinlangan</option>
                  <option value="collecting">Yig'ilmoqda</option>
                  <option value="ready">Tayyor</option>
                  <option value="assigned_to_courier">Kuryerga tayinlangan</option>
                  <option value="delivering">Yetkazilmoqda</option>
                  <option value="delivered">Yetkazildi</option>
                  <option value="cancelled">Bekor qilindi</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

