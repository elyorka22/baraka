'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: number
  is_active: boolean
  created_at: string
}

interface BannersListProps {
  banners: Banner[]
}

export function BannersList({ banners: initialBanners }: BannersListProps) {
  const router = useRouter()
  const [banners, setBanners] = useState(initialBanners)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setBanners(banners.map(b => 
        b.id === id ? { ...b, is_active: !currentStatus } : b
      ))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот баннер?')) return

    setDeleting(id)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)

    if (!error) {
      setBanners(banners.filter(b => b.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <div key={banner.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex">
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-6 flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{banner.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  banner.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {banner.is_active ? 'Активен' : 'Неактивен'}
                </span>
                <span className="text-sm text-gray-500">
                  Позиция: {banner.position}
                </span>
              </div>
              {banner.link_url && (
                <p className="text-sm text-gray-600">
                  Ссылка: <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">{banner.link_url}</a>
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/admin/banners/${banner.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Редактировать
              </button>
              <button
                onClick={() => handleToggleActive(banner.id, banner.is_active)}
                className={`px-4 py-2 rounded transition-colors ${
                  banner.is_active
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {banner.is_active ? 'Деактивировать' : 'Активировать'}
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                disabled={deleting === banner.id}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded transition-colors"
              >
                {deleting === banner.id ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Баннеров пока нет</p>
        </div>
      )}
    </div>
  )
}

