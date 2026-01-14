'use client'

interface Restaurant {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
}

interface Dish {
  id: string
  name: string
  price: number
  is_available: boolean
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

interface WarehouseStatsProps {
  restaurant: Restaurant
  stats: Stats
  dishes: Dish[]
}

export function WarehouseStats({ restaurant, stats, dishes }: WarehouseStatsProps) {
  return (
    <div className="space-y-6">
      {/* Информация о складе */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ombor ma'lumotlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nomi</p>
            <p className="text-base font-medium text-gray-900">{restaurant.name}</p>
          </div>
          {restaurant.address && (
            <div>
              <p className="text-sm text-gray-500">Manzil</p>
              <p className="text-base font-medium text-gray-900">{restaurant.address}</p>
            </div>
          )}
          {restaurant.phone && (
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="text-base font-medium text-gray-900">{restaurant.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Статистика заказов */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyurtmalar statistikasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Jami buyurtmalar</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Kutilmoqda</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Tayyor</p>
            <p className="text-2xl font-bold text-blue-700">{stats.readyOrders}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Yetkazilgan</p>
            <p className="text-2xl font-bold text-green-700">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* Статистика товаров */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mahsulotlar statistikasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Jami mahsulotlar</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDishes}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Mavjud</p>
            <p className="text-2xl font-bold text-green-700">{stats.availableDishes}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Mavjud emas</p>
            <p className="text-2xl font-bold text-gray-700">
              {stats.totalDishes - stats.availableDishes}
            </p>
          </div>
        </div>
      </div>

      {/* Выручка */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daromad</h3>
        <div className="bg-green-50 rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-2">Jami daromad (yetkazilgan buyurtmalar)</p>
          <p className="text-3xl font-bold text-green-700">
            {Number(stats.totalRevenue).toLocaleString('ru-RU')} so'm
          </p>
        </div>
      </div>
    </div>
  )
}

