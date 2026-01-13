'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditRestaurantForm } from './EditRestaurantForm'
import { DishesManagement } from './DishesManagement'

interface Restaurant {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  image_url: string | null
  is_active: boolean
}

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  global_category_id: string | null
  is_available: boolean
  global_categories?: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface Stats {
  totalDishes: number
  availableDishes: number
  totalOrders: number
  totalCategories: number
}

interface RestaurantTabsProps {
  restaurant: Restaurant
  dishes: Dish[]
  categories: Category[]
  stats: Stats
}

export function RestaurantTabs({ restaurant, dishes, categories, stats }: RestaurantTabsProps) {
  const [activeTab, setActiveTab] = useState<'dishes' | 'stats' | 'settings'>('dishes')
  const router = useRouter()

  // Группируем товары по категориям для отображения
  const dishesByCategory = categories.map(category => ({
    category,
    dishes: dishes.filter(d => d.global_category_id === category.id)
  })).filter(group => group.dishes.length > 0)

  // Товары без категории
  const uncategorizedDishes = dishes.filter(d => !d.global_category_id)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Вкладки */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-4 md:px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'dishes'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mahsulotlar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistika
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sozlamalar
          </button>
        </nav>
      </div>

      {/* Содержимое вкладок */}
      <div className="p-4 md:p-6">
        {activeTab === 'dishes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mahsulotlar</h2>
              <div className="flex gap-2">
                <a
                  href={`/admin/restaurants/${restaurant.id}/dishes/new`}
                  className="bg-black hover:bg-gray-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  + Yangi mahsulot
                </a>
              </div>
            </div>

            {dishes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Hozircha mahsulotlar yo'q</p>
                <a
                  href={`/admin/restaurants/${restaurant.id}/dishes/new`}
                  className="mt-4 inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Birinchi mahsulotni qo'shing
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {dishesByCategory.map(({ category, dishes: categoryDishes }) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryDishes.map((dish) => (
                        <div key={dish.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                          {dish.image_url ? (
                            <img
                              src={dish.image_url}
                              alt={dish.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                            </div>
                          )}
                          <h4 className="font-bold text-gray-900 mb-1">{dish.name}</h4>
                          {dish.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-bold text-gray-900">
                              {Number(dish.price).toLocaleString('ru-RU')} so'm
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              dish.is_available 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {dish.is_available ? 'Mavjud' : 'Mavjud emas'}
                            </span>
                          </div>
                          <a
                            href={`/admin/restaurants/${restaurant.id}/dishes/${dish.id}`}
                            className="block w-full bg-black hover:bg-gray-800 text-white text-center px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                          >
                            Tahrirlash
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {uncategorizedDishes.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Kategoriyasi yo'q</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorizedDishes.map((dish) => (
                        <div key={dish.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                          {dish.image_url ? (
                            <img
                              src={dish.image_url}
                              alt={dish.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                            </div>
                          )}
                          <h4 className="font-bold text-gray-900 mb-1">{dish.name}</h4>
                          {dish.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-bold text-gray-900">
                              {Number(dish.price).toLocaleString('ru-RU')} so'm
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              dish.is_available 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {dish.is_available ? 'Mavjud' : 'Mavjud emas'}
                            </span>
                          </div>
                          <a
                            href={`/admin/restaurants/${restaurant.id}/dishes/${dish.id}`}
                            className="block w-full bg-black hover:bg-gray-800 text-white text-center px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                          >
                            Tahrirlash
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Statistika</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Jami mahsulotlar</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats.totalDishes}
                  </p>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Mavjud mahsulotlar</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats.availableDishes}
                  </p>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900" style={{ width: `${stats.totalDishes > 0 ? (stats.availableDishes / stats.totalDishes) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Buyurtmalar</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Kategoriyalar</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats.totalCategories}
                  </p>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ma'lumotlar</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Holati:</span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    restaurant.is_active 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {restaurant.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
                {restaurant.address && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Manzil:</span>
                    <span className="text-gray-900 font-medium">{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="text-gray-900 font-medium">{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Sozlamalar</h2>
            <EditRestaurantForm restaurant={restaurant} />
          </div>
        )}
      </div>
    </div>
  )
}

