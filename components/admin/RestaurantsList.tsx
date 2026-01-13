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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all flex flex-col">
          <div className="relative">
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-40 md:h-48 object-cover"
              />
            ) : (
              <div className="w-full h-40 md:h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-4xl md:text-6xl">🏪</span>
              </div>
            )}
            <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
              restaurant.is_active 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {restaurant.is_active ? 'Faol' : 'Nofaol'}
            </span>
          </div>
          <div className="p-3 md:p-4 flex-1 flex flex-col">
            <div className="mb-2">
              <h3 className="text-base md:text-lg font-bold text-gray-900">{restaurant.name}</h3>
            </div>
            {restaurant.description && (
              <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-1">
                {restaurant.description}
              </p>
            )}
            {restaurant.address && (
              <div className="flex items-center text-gray-500 text-xs md:text-sm mb-1">
                <span className="mr-1">📍</span>
                <span className="truncate">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center text-gray-500 text-xs md:text-sm mb-3">
                <span className="mr-1">📞</span>
                <span>{restaurant.phone}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}/dishes`)}
                className="bg-black hover:bg-gray-800 text-white px-2 md:px-3 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm"
              >
                📦 Mahsulotlar
              </button>
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-2 md:px-3 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm"
              >
                ✏️ Tahrirlash
              </button>
              <button
                onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                className={`px-2 md:px-3 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm ${
                  restaurant.is_active
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                {restaurant.is_active ? '❌ Deaktiv' : '✅ Aktiv'}
              </button>
              <button
                onClick={() => handleDelete(restaurant.id)}
                disabled={deleting === restaurant.id}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-2 md:px-3 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm"
              >
                {deleting === restaurant.id ? '...' : '🗑️ O\'chirish'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {restaurants.length === 0 && (
        <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">🏪</div>
          <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
        </div>
      )}
    </div>
  )
}

