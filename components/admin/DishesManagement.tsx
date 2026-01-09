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
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) return

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
        <div key={category.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            <a
              href={`/admin/restaurants/${restaurantId}/categories/${category.id}`}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Редактировать категорию
            </a>
          </div>
          {categoryDishes.length === 0 ? (
            <p className="text-gray-500">Нет блюд в этой категории</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="border border-gray-200 rounded-lg p-4">
                  {dish.image_url && (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">{dish.name}</h3>
                  {dish.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-orange-500">{dish.price} ₽</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      dish.is_available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dish.is_available ? 'Доступно' : 'Недоступно'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/restaurants/${restaurantId}/dishes/${dish.id}`)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleToggleAvailable(dish.id, dish.is_available)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        dish.is_available
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      {dish.is_available ? 'Скрыть' : 'Показать'}
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      disabled={deleting === dish.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      {deleting === dish.id ? '...' : '✕'}
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

