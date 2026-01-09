'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: number
  is_active: boolean
}

interface EditBannerFormProps {
  banner: Banner
}

export function EditBannerForm({ banner }: EditBannerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: banner.title,
    image_url: banner.image_url,
    link_url: banner.link_url || '',
    position: banner.position,
    is_active: banner.is_active,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseClient()
    const { error: updateError } = await supabase
      .from('banners')
      .update({
        title: formData.title,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        position: formData.position,
        is_active: formData.is_active,
      })
      .eq('id', banner.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/admin/banners')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm font-medium text-gray-700">Активен</span>
        </label>
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
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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

