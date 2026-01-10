'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'

export default function NewBannerPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Необходимо войти в систему')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('banners')
      .insert([{
        title: formData.title,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        position: formData.position,
        is_active: true,
        created_by: user.id,
      }])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/banners')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Yangi banner qo'shish
            </h1>
            <p className="text-gray-600">Bosh sahifada ko'rsatiladigan banner yarating</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6 border border-gray-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Позиция
              </label>
              <input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка (опционально)
              </label>
              <input
                id="link_url"
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>

            <ImageUpload
              bucket="banners"
              currentImageUrl={formData.image_url}
              onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
              onUploadError={(err) => setError(err)}
            />

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !formData.image_url}
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

