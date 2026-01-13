'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories: initialCategories }: CategoriesListProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdating(id)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('global_categories')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setCategories(categories.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ))
    }
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`p-4 rounded-lg border transition-all ${
              category.is_active
                ? 'bg-gray-50 border-gray-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                {category.name}
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  category.is_active
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {category.is_active ? 'Faol' : 'Nofaol'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(category.id, category.is_active)}
                disabled={updating === category.id}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                  category.is_active
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-black hover:bg-gray-800 text-white'
                } disabled:bg-gray-400`}
              >
                {updating === category.id
                  ? 'Yuklanmoqda...'
                  : category.is_active
                  ? 'Yashirish'
                  : 'Ko\'rsatish'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Hozircha kategoriyalar yo'q</p>
        </div>
      )}
    </div>
  )
}

