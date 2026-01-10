'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'

export default function NewCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id as string
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseClient()
    const { error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: formData.name,
        restaurant_id: restaurantId,
        image_url: formData.image_url || null,
      }])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/restaurants/${restaurantId}/dishes`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Yangi kategoriya qo'shish
            </h1>
            <p className="text-gray-600">Mahsulotlar kategoriyasini yarating</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6 border border-gray-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <ImageUpload
              bucket="categories"
              currentImageUrl={formData.image_url}
              onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
              onUploadError={(err) => setError(err)}
            />

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
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
        </div>
      </div>
    </div>
  )
}

