'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  global_category_id: string | null
  is_available: boolean
  badge_text?: string | null
}

interface Category {
  id: string
  name: string
}

interface EditDishFormProps {
  dish: Dish
  categories: Category[]
  restaurantId: string
}

export function EditDishForm({ dish, categories, restaurantId }: EditDishFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: dish.name,
    description: dish.description || '',
    price: dish.price.toString(),
    global_category_id: dish.global_category_id || '',
    image_url: dish.image_url || '',
    is_available: dish.is_available,
    badge_text: dish.badge_text || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseClient()
    const { error: updateError } = await supabase
      .from('dishes')
      .update({
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: null, // Локальные категории больше не используются
        global_category_id: formData.global_category_id || null,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
        badge_text: formData.badge_text || null,
      })
      .eq('id', dish.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/restaurants/${restaurantId}/dishes`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-4 md:space-y-6 border border-gray-100">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="global_category_id" className="block text-sm font-medium text-gray-700 mb-2">
          Kategoriya
        </label>
        <select
          id="global_category_id"
          value={formData.global_category_id}
          onChange={(e) => setFormData({ ...formData, global_category_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        >
          <option value="">Kategoriyani tanlang (ixtiyoriy)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Faol kategoriyalardan birini tanlang
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Название *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          Цена (so'm) *
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="badge_text" className="block text-sm font-medium text-gray-700 mb-2">
          Текст бейджа
        </label>
        <input
          id="badge_text"
          type="text"
          value={formData.badge_text}
          onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          placeholder="Например: Mavjud, -15%, Top, Новый"
        />
        <p className="mt-1 text-xs text-gray-500">
          Если оставить пустым, бейдж не будет отображаться
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_available}
            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
          <span className="text-sm font-medium text-gray-700">Доступно</span>
        </label>
      </div>

      <ImageUpload
        bucket="dishes"
        currentImageUrl={formData.image_url}
        onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
        onUploadError={(err) => setError(err)}
      />

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}

