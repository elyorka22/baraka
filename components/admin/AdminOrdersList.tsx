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

interface RestaurantWithBot {
  id: string
  name: string
  telegram_chat_id: string
}

interface AdminOrdersListProps {
  orders: Order[]
  restaurantsWithBots: RestaurantWithBot[]
}

export function AdminOrdersList({ orders: initialOrders, restaurantsWithBots }: AdminOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showDistributeModal, setShowDistributeModal] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)

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

  const handleDistributeToBot = async (orderId: string, chatId: string) => {
    setSending(orderId)
    try {
      const response = await fetch('/api/orders/notify-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, chatId }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Ошибка отправки в Telegram:', data)
        
        let errorMessage = data.error || 'Xabar yuborilmadi'
        
        // Более понятные сообщения об ошибках
        if (errorMessage.includes('chat not found')) {
          errorMessage = 'Chat ID topilmadi.\n\nYechim:\n1. Botni /start buyrug\'i bilan ishga tushiring\n2. Ombor sozlamalarida Chat ID ni qayta tekshiring\n3. "Test qilish" tugmasini bosing'
        } else if (errorMessage.includes('bloklangan')) {
          errorMessage = 'Bot bloklangan.\n\nYechim:\n1. Foydalanuvchi botni bloklagan\n2. Botni blokdan olib tashlang\n3. Botga /start buyrug\'ini yuboring'
        }
        
        alert(`Xatolik: ${errorMessage}`)
      } else {
        alert('Buyurtma botga muvaffaqiyatli yuborildi!')
        setShowDistributeModal(null)
      }
    } catch (error: any) {
      console.error('Ошибка при отправке:', error)
      alert('Xatolik: ' + (error.message || 'Tarmoq xatosi'))
    } finally {
      setSending(null)
    }
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4 flex flex-col">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    #{order.id.slice(0, 8)}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="mt-auto">
                <div className="mb-3">
                  <span className="text-lg md:text-xl font-bold text-gray-900">
                    {Number(order.total_price).toLocaleString('ru-RU')} so'm
                  </span>
                </div>
                <button
                  onClick={() => setShowDistributeModal(order.id)}
                  className="w-full bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  Botlarga tarqatish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно для выбора бота */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Botni tanlang
                </h3>
                <button
                  onClick={() => setShowDistributeModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {restaurantsWithBots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Sozlangan botlar yo'q</p>
                  <p className="text-sm text-gray-400">
                    Botlarni sozlash uchun ombor sozlamalariga o'ting
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {restaurantsWithBots.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => handleDistributeToBot(showDistributeModal, restaurant.telegram_chat_id)}
                      disabled={sending === showDistributeModal}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">{restaurant.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Chat ID: {restaurant.telegram_chat_id}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {sending === showDistributeModal && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  Yuborilmoqda...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

