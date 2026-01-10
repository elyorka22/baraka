'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface RestaurantsListProps {
  restaurants: Restaurant[]
}

export function RestaurantsList({ restaurants: initialRestaurants }: RestaurantsListProps) {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('restaurants')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setRestaurants(restaurants.map(r => 
        r.id === id ? { ...r, is_active: !currentStatus } : r
      ))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот склад?')) return

    setDeleting(id)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (!error) {
      setRestaurants(restaurants.filter(r => r.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
          <div className="relative">
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-6xl">🏪</span>
              </div>
            )}
            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
              restaurant.is_active 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {restaurant.is_active ? 'Faol' : 'Nofaol'}
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
            </div>
            {restaurant.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {restaurant.description}
              </p>
            )}
            {restaurant.address && (
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <span className="mr-2">📍</span>
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className="mr-2">📞</span>
                <span>{restaurant.phone}</span>
              </div>
            )}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}/dishes`)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                📦 Mahsulotlar
              </button>
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                ✏️ Tahrirlash
              </button>
              <button
                onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  restaurant.is_active
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {restaurant.is_active ? '❌ Deaktiv' : '✅ Aktiv'}
              </button>
              <button
                onClick={() => handleDelete(restaurant.id)}
                disabled={deleting === restaurant.id}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                {deleting === restaurant.id ? '...' : '🗑️ O\'chirish'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {restaurants.length === 0 && (
        <div className="col-span-full text-center py-16 bg-white rounded-xl shadow border border-gray-100">
          <div className="text-6xl mb-4">🏪</div>
          <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
        </div>
      )}
    </div>
  )
}

