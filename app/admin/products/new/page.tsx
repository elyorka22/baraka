'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'
import { Navbar } from '@/components/common/Navbar'

export default function NewProductPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    restaurant_id: '',
    image_url: '',
    badge_text: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileData || profileData.role !== 'super_admin') {
        router.push('/')
        return
      }

      setProfile(profileData)
      setUserLoading(false)

      // Загружаем склады
      const { data: warehousesData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (warehousesData) setWarehouses(warehousesData)
    }

    loadUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.restaurant_id) {
      setError('Omborni tanlang')
      setLoading(false)
      return
    }

    const supabase = createSupabaseClient()
    const { error: insertError } = await supabase
      .from('dishes')
      .insert([{
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: null,
        restaurant_id: formData.restaurant_id,
        image_url: formData.image_url || null,
        badge_text: formData.badge_text || null,
        is_available: true,
      }])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/products')
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <a
              href="/admin/products"
              className="text-gray-900 hover:text-gray-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors"
            >
              <span>←</span> Mahsulotlarga qaytish
            </a>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Yangi mahsulot qo'shish
            </h1>
            <p className="text-gray-600">Yangi mahsulot kartasini yarating</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6 border border-gray-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="restaurant_id" className="block text-sm font-medium text-gray-700 mb-2">
                Ombor *
              </label>
              <select
                id="restaurant_id"
                value={formData.restaurant_id}
                onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
              >
                <option value="">Omborni tanlang</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nomi *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                placeholder="Mahsulot nomi"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Tavsif
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                placeholder="Mahsulot haqida batafsil ma'lumot"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Narxi (so'm) *
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
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="badge_text" className="block text-sm font-medium text-gray-700 mb-2">
                Yorliq matni
              </label>
              <input
                id="badge_text"
                type="text"
                value={formData.badge_text}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                placeholder="Masalan: Mavjud, -15%, Top, Yangi"
              />
              <p className="mt-1 text-xs text-gray-500">
                Agar bo'sh qoldirilsa, yorliq ko'rsatilmaydi
              </p>
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
                disabled={loading || !formData.restaurant_id}
                className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

