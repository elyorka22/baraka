'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Restaurant {
  id: string
  name: string
  manager_id: string | null
}

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: string
}

interface Order {
  id: string
  status: string
  restaurant_id: string
}

interface WarehouseAssignmentsProps {
  restaurant: Restaurant
  collectors: Profile[]
  couriers: Profile[]
  orders: Order[]
}

export function WarehouseAssignments({
  restaurant,
  collectors,
  couriers,
  orders,
}: WarehouseAssignmentsProps) {
  const [assigning, setAssigning] = useState<string | null>(null)

  // Заказы, которые можно назначить
  const assignableOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'ready'
  )

  const handleAssignCollector = async (orderId: string, collectorId: string) => {
    setAssigning(orderId)
    const supabase = createSupabaseClient()

    // Обновляем статус заказа
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'assigned_to_collector',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (orderError) {
      alert(`Xatolik: ${orderError.message}`)
      setAssigning(null)
      return
    }

    // Создаем или обновляем назначение
    const { error: assignmentError } = await supabase
      .from('order_assignments')
      .upsert({
        order_id: orderId,
        collector_id: collectorId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id || '',
        status: 'assigned',
      }, {
        onConflict: 'order_id'
      })

    if (assignmentError) {
      alert(`Xatolik: ${assignmentError.message}`)
    } else {
      alert('Yig\'uvchi tayinlandi')
      window.location.reload()
    }
    setAssigning(null)
  }

  const handleAssignCourier = async (orderId: string, courierId: string) => {
    setAssigning(orderId)
    const supabase = createSupabaseClient()

    // Обновляем статус заказа
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'assigned_to_courier',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (orderError) {
      alert(`Xatolik: ${orderError.message}`)
      setAssigning(null)
      return
    }

    // Создаем или обновляем назначение
    const { error: assignmentError } = await supabase
      .from('order_assignments')
      .upsert({
        order_id: orderId,
        courier_id: courierId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id || '',
        status: 'assigned',
      }, {
        onConflict: 'order_id'
      })

    if (assignmentError) {
      alert(`Xatolik: ${assignmentError.message}`)
    } else {
      alert('Kuryer tayinlandi')
      window.location.reload()
    }
    setAssigning(null)
  }

  return (
    <div className="space-y-6">
      {/* Назначение сборщиков */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yig'uvchilarni tayinlash</h3>
        {assignableOrders.filter(o => o.status === 'pending').length === 0 ? (
          <p className="text-gray-500">Tayinlash uchun buyurtmalar yo'q</p>
        ) : (
          <div className="space-y-4">
            {assignableOrders
              .filter(o => o.status === 'pending')
              .map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        Buyurtma #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">Kutilmoqda</p>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignCollector(order.id, e.target.value)
                        }
                      }}
                      disabled={assigning === order.id}
                      defaultValue=""
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:opacity-50"
                    >
                      <option value="">Yig'uvchi tanlang</option>
                      {collectors.map((collector) => (
                        <option key={collector.id} value={collector.id}>
                          {collector.full_name || collector.phone || collector.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Назначение курьеров */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kuryerlarni tayinlash</h3>
        {assignableOrders.filter(o => o.status === 'ready').length === 0 ? (
          <p className="text-gray-500">Tayinlash uchun tayyor buyurtmalar yo'q</p>
        ) : (
          <div className="space-y-4">
            {assignableOrders
              .filter(o => o.status === 'ready')
              .map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        Buyurtma #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">Tayyor</p>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignCourier(order.id, e.target.value)
                        }
                      }}
                      disabled={assigning === order.id}
                      defaultValue=""
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:opacity-50"
                    >
                      <option value="">Kuryer tanlang</option>
                      {couriers.map((courier) => (
                        <option key={courier.id} value={courier.id}>
                          {courier.full_name || courier.phone || courier.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Список доступных сотрудников */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Mavjud yig'uvchilar</h4>
          {collectors.length === 0 ? (
            <p className="text-sm text-gray-500">Yig'uvchilar yo'q</p>
          ) : (
            <ul className="space-y-2">
              {collectors.map((collector) => (
                <li key={collector.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {collector.full_name || 'Ism ko\'rsatilmagan'}
                  </p>
                  {collector.phone && (
                    <p className="text-sm text-gray-500">{collector.phone}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Mavjud kuryerlar</h4>
          {couriers.length === 0 ? (
            <p className="text-sm text-gray-500">Kuryerlar yo'q</p>
          ) : (
            <ul className="space-y-2">
              {couriers.map((courier) => (
                <li key={courier.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {courier.full_name || 'Ism ko\'rsatilmagan'}
                  </p>
                  {courier.phone && (
                    <p className="text-sm text-gray-500">{courier.phone}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

