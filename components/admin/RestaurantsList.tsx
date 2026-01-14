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
  manager_id: string | null
  created_at: string
  profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

interface RestaurantsListProps {
  restaurants: Restaurant[]
}

export function RestaurantsList({ restaurants: initialRestaurants }: RestaurantsListProps) {
  const router = useRouter()
  const [restaurants] = useState(initialRestaurants)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{restaurant.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  restaurant.is_active 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  {restaurant.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
            {restaurant.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                {restaurant.description}
              </p>
            )}
            {restaurant.address && (
              <div className="text-gray-500 text-sm mb-2">
                <span className="truncate">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="text-gray-500 text-sm mb-2">
                <span>{restaurant.phone}</span>
              </div>
            )}
            {restaurant.profiles && (
              <div className="text-gray-500 text-sm mb-4">
                <span className="font-medium">Menejer:</span> {restaurant.profiles.full_name || restaurant.profiles.email || 'Ko\'rsatilmagan'}
              </div>
            )}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => router.push(`/warehouse/${restaurant.id}`)}
                className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                Boshqarish
              </button>
              <button
                onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-medium text-sm md:text-base"
              >
                Tahrirlash
              </button>
            </div>
          </div>
        </div>
      ))}
      {restaurants.length === 0 && (
        <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
        </div>
      )}
    </div>
  )
}

