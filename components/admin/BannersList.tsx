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
        <div key={banner.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{banner.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    banner.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {banner.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Pozitsiya: {banner.position}
                  </span>
                </div>
                {banner.link_url && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 hover:underline font-medium">{banner.link_url}</a>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/admin/banners/${banner.id}`)}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleToggleActive(banner.id, banner.is_active)}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    banner.is_active
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-black hover:bg-gray-800'
                  } text-white`}
                >
                  {banner.is_active ? 'Deaktiv' : 'Aktiv'}
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={deleting === banner.id}
                  className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {deleting === banner.id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {banners.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Hozircha bannerlar yo'q</p>
        </div>
      )}
    </div>
  )
}

