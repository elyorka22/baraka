'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomerMenuPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      
      // Загружаем активные рестораны
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (restaurantsData) {
        setRestaurants(restaurantsData)
      }

      // Загружаем активные баннеры
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position')

      if (bannersData) {
        setBanners(bannersData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/customer/orders"
                className="text-gray-700 hover:text-orange-500"
              >
                Мои заказы
              </Link>
              <Link
                href="/customer/cart"
                className="text-gray-700 hover:text-orange-500"
              >
                Корзина
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {banners.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{banner.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Рестораны</h1>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ресторанов пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/customer/restaurant/${restaurant.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  {restaurant.address && (
                    <p className="text-gray-500 text-sm">
                      📍 {restaurant.address}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

