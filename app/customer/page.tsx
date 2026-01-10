'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/common/LogoutButton'

export default function CustomerMenuPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      
      // Проверяем авторизацию
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
      }
      
      // Загружаем активные склады
      const { data: warehousesData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (warehousesData) {
        setRestaurants(warehousesData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
            <div className="flex space-x-4 items-center">
              {user ? (
                <>
                  <Link
                    href="/customer/orders"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    Mening buyurtmalarim
                  </Link>
                  <Link
                    href="/customer/cart"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    Savat
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mahsulotlar omborlari</h1>
          <p className="text-gray-600">Eng yaxshi mahsulotlarni tanlang va uyingizga buyurtma bering</p>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/customer/restaurant/${restaurant.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative">
                  {restaurant.image_url ? (
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <span className="text-6xl">🏪</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Faol
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {restaurant.name}
                    </h3>
                    <span className="text-2xl">🛒</span>
                  </div>
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  {restaurant.address && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="mr-2">📍</span>
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center text-gray-500 text-sm mt-2">
                      <span className="mr-2">📞</span>
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-green-600 font-semibold text-sm">Mahsulotlarni ko'rish →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

