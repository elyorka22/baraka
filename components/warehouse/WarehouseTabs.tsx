'use client'

import { useState } from 'react'
import { WarehouseStats } from './WarehouseStats'
import { WarehouseOrders } from './WarehouseOrders'
import { WarehouseAssignments } from './WarehouseAssignments'
import { WarehouseProducts } from './WarehouseProducts'

interface Restaurant {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  image_url: string | null
  is_active: boolean
  manager_id: string | null
  telegram_chat_id: string | null
  created_at: string
}

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

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  restaurant_id: string
  is_available: boolean
  badge_text: string | null
  global_category_id: string | null
  created_at: string
  global_categories?: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: string
}

interface Stats {
  totalOrders: number
  pendingOrders: number
  readyOrders: number
  deliveredOrders: number
  totalDishes: number
  availableDishes: number
  totalRevenue: number
}

interface WarehouseTabsProps {
  restaurant: Restaurant
  orders: Order[]
  dishes: Dish[]
  collectors: Profile[]
  couriers: Profile[]
  categories: Category[]
  stats: Stats
  isSuperAdmin: boolean
}

export function WarehouseTabs({
  restaurant,
  orders,
  dishes,
  collectors,
  couriers,
  categories,
  stats,
  isSuperAdmin,
}: WarehouseTabsProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'assignments' | 'products'>('stats')

  const tabs = [
    { id: 'stats' as const, label: 'Statistika' },
    { id: 'orders' as const, label: 'Buyurtmalar' },
    { id: 'products' as const, label: 'Mahsulotlar' },
    { id: 'assignments' as const, label: 'Tayinlash' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Вкладки */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex -mb-px min-w-max md:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="p-3 md:p-6">
        {activeTab === 'stats' && (
          <WarehouseStats restaurant={restaurant} stats={stats} dishes={dishes} />
        )}

        {activeTab === 'orders' && (
          <WarehouseOrders orders={orders} restaurantId={restaurant.id} />
        )}

        {activeTab === 'products' && (
          <WarehouseProducts
            restaurant={restaurant}
            dishes={dishes}
            categories={categories}
          />
        )}

        {activeTab === 'assignments' && (
          <WarehouseAssignments
            restaurant={restaurant}
            collectors={collectors}
            couriers={couriers}
            orders={orders}
          />
        )}
      </div>
    </div>
  )
}

