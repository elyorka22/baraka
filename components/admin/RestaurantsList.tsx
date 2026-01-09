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
    if (!confirm('Вы уверены, что хотите удалить этот ресторан?')) return

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
        <div key={restaurant.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                restaurant.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {restaurant.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            {restaurant.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {restaurant.description}
              </p>
            )}
            {restaurant.address && (
              <p className="text-gray-500 text-sm mb-1">
                📍 {restaurant.address}
              </p>
            )}
            {restaurant.phone && (
              <p className="text-gray-500 text-sm mb-4">
                📞 {restaurant.phone}
              </p>
            )}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}/dishes`)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
              >
                Блюда
              </button>
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                className={`px-4 py-2 rounded transition-colors ${
                  restaurant.is_active
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {restaurant.is_active ? 'Деактивировать' : 'Активировать'}
              </button>
              <button
                onClick={() => handleDelete(restaurant.id)}
                disabled={deleting === restaurant.id}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded transition-colors"
              >
                {deleting === restaurant.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {restaurants.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">Ресторанов пока нет</p>
        </div>
      )}
    </div>
  )
}

