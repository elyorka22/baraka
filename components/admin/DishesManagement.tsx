'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  image_url: string | null
}

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
  is_available: boolean
  categories: Category
}

interface DishesManagementProps {
  restaurantId: string
  categories: Category[]
  dishes: Dish[]
}

export function DishesManagement({ restaurantId, categories, dishes: initialDishes }: DishesManagementProps) {
  const router = useRouter()
  const [dishes, setDishes] = useState(initialDishes)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      setDishes(dishes.map(d => 
        d.id === id ? { ...d, is_available: !currentStatus } : d
      ))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return

    setDeleting(id)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id)

    if (!error) {
      setDishes(dishes.filter(d => d.id !== id))
    }
    setDeleting(null)
  }

  const dishesByCategory = categories.map(category => ({
    category,
    dishes: dishes.filter(d => d.category_id === category.id)
  }))

  return (
    <div className="space-y-8">
      {dishesByCategory.map(({ category, dishes: categoryDishes }) => (
        <div key={category.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-green-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            </div>
            <a
              href={`/admin/restaurants/${restaurantId}/categories/${category.id}`}
              className="text-gray-900 hover:text-gray-700 text-sm font-medium"
            >
              Tahrirlash
            </a>
          </div>
          {categoryDishes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <p className="text-gray-500">Bu kategoriyada mahsulotlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1">{dish.name}</h3>
                  {dish.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xl font-bold text-green-600">{dish.price}</span>
                      <span className="text-gray-500 text-sm ml-1">₽</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dish.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dish.is_available ? 'Mavjud' : 'Mavjud emas'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/restaurants/${restaurantId}/dishes/${dish.id}`)}
                      className="flex-1 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleToggleAvailable(dish.id, dish.is_available)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                        dish.is_available
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-black hover:bg-gray-800'
                      } text-white`}
                    >
                      {dish.is_available ? 'Yashirish' : 'Ko\'rsatish'}
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      disabled={deleting === dish.id}
                      className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                    >
                      {deleting === dish.id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

