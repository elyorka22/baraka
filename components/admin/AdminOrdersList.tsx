'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Order {
  id: string
  status: string
  total_price: number
  address: string
  phone: string
  customer_email: string | null
  notes: string | null
  created_at: string
  restaurants: {
    id: string
    name: string
  } | null
  profiles: {
    full_name: string | null
    phone: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    dishes: {
      name: string
      price: number
    } | null
  }>
}

interface AdminOrdersListProps {
  orders: Order[]
}

export function AdminOrdersList({ orders: initialOrders }: AdminOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')

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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  return (
    <div className="space-y-6">
      {/* Фильтр по статусу */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Holat bo'yicha filtrlash
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        >
          <option value="all">Barchasi</option>
          <option value="pending">Qayta ishlash kutilmoqda</option>
          <option value="assigned_to_collector">Yig'uvchiga tayinlangan</option>
          <option value="collecting">Yig'ilmoqda</option>
          <option value="ready">Yetkazib berishga tayyor</option>
          <option value="assigned_to_courier">Kuryerga tayinlangan</option>
          <option value="delivering">Yetkazilmoqda</option>
          <option value="delivered">Yetkazib berildi</option>
          <option value="cancelled">Bekor qilindi</option>
        </select>
      </div>

      {/* Статистика */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <p className="text-sm text-gray-600">
          Jami: <span className="font-semibold text-gray-900">{filteredOrders.length}</span> buyurtma
          {filteredOrders.length !== orders.length && (
            <span className="ml-2">
              (filtrdan: {orders.length})
            </span>
          )}
        </p>
      </div>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">
            {filterStatus !== 'all'
              ? 'Filtrlarga mos buyurtmalar topilmadi'
              : 'Hozircha buyurtmalar yo\'q'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      Buyurtma #{order.id.slice(0, 8)}
                    </h3>
                    <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {order.restaurants?.name || 'Noma\'lum ombor'} • {new Date(order.created_at).toLocaleString('ru-RU')}
                  </p>
                  {order.profiles?.full_name && (
                    <p className="text-sm text-gray-600">
                      Mijoz: {order.profiles.full_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Yetkazib berish manzili</p>
                <p className="text-sm font-medium text-gray-900">{order.address}</p>
                {order.phone && (
                  <p className="text-sm text-gray-600 mt-1">Telefon: {order.phone}</p>
                )}
              </div>

              {order.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Izoh</p>
                  <p className="text-sm text-gray-900">{order.notes}</p>
                </div>
              )}

              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Buyurtma tarkibi:</h4>
                <div className="space-y-1">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.dishes?.name || 'Noma\'lum mahsulot'} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {Number(item.price * item.quantity).toLocaleString('ru-RU')} so'm
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg md:text-xl font-bold text-gray-900">
                  Jami: {Number(order.total_price).toLocaleString('ru-RU')} so'm
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

