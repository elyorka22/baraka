'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/common/ImageUpload'

interface Restaurant {
  id: string
  name: string
}

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  restaurant_id: string
  is_available: boolean
  badge_text: string | null
  global_category_id: string | null
  created_at: string
  global_categories?: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
  is_active: boolean
}

interface WarehouseProductsProps {
  restaurant: Restaurant
  dishes: Dish[]
  categories: Category[]
}

export function WarehouseProducts({ restaurant, dishes: initialDishes, categories }: WarehouseProductsProps) {
  const router = useRouter()
  const [dishes, setDishes] = useState(initialDishes)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterAvailable, setFilterAvailable] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    badge_text: '',
    global_category_id: '',
    is_available: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      setDishes(dishes.map(d => d.id === id ? { ...d, is_available: !currentStatus } : d))
    } else {
      alert(`Xatolik: ${error.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) return

    setDeleting(id)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id)

    if (!error) {
      setDishes(dishes.filter(d => d.id !== id))
    } else {
      alert(`Xatolik: ${error.message}`)
    }
    setDeleting(null)
  }

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish)
    setFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      image_url: dish.image_url || '',
      badge_text: dish.badge_text || '',
      global_category_id: dish.global_category_id || '',
      is_available: dish.is_available,
    })
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name || !formData.price) {
      setError('Nomi va narxi majburiy')
      setLoading(false)
      return
    }

    const supabase = createSupabaseClient()
    const dishData = {
      name: formData.name,
      description: formData.description || null,
      price: Number(formData.price),
      image_url: formData.image_url || null,
      badge_text: formData.badge_text || null,
      global_category_id: formData.global_category_id || null,
      restaurant_id: restaurant.id,
      is_available: formData.is_available,
    }

    if (editingDish) {
      // Обновление существующего товара
      const { error } = await supabase
        .from('dishes')
        .update(dishData)
        .eq('id', editingDish.id)

      if (!error) {
        router.refresh()
        setShowAddForm(false)
        setEditingDish(null)
        setFormData({
          name: '',
          description: '',
          price: '',
          image_url: '',
          badge_text: '',
          global_category_id: '',
          is_available: true,
        })
      } else {
        setError(error.message)
      }
    } else {
      // Создание нового товара
      const { error } = await supabase
        .from('dishes')
        .insert([dishData])

      if (!error) {
        router.refresh()
        setShowAddForm(false)
        setFormData({
          name: '',
          description: '',
          price: '',
          image_url: '',
          badge_text: '',
          global_category_id: '',
          is_available: true,
        })
      } else {
        setError(error.message)
      }
    }

    setLoading(false)
  }

  const filteredDishes = dishes.filter(dish => {
    if (filterAvailable === 'available' && !dish.is_available) return false
    if (filterAvailable === 'unavailable' && dish.is_available) return false
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Кнопка добавления и фильтры */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-start md:items-center">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            setEditingDish(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              image_url: '',
              badge_text: '',
              global_category_id: '',
              is_available: true,
            })
          }}
          className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm md:text-base"
        >
          {showAddForm ? 'Bekor qilish' : '+ Yangi mahsulot'}
        </button>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 md:flex-none md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Barchasi</option>
            <option value="available">Mavjud</option>
            <option value="unavailable">Mavjud emas</option>
          </select>
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDish ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
          </h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                placeholder="Mahsulot nomi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                placeholder="Mahsulot haqida ma'lumot"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narxi (so'm) <span className="text-red-500">*</span>
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya
                </label>
                <select
                  value={formData.global_category_id}
                  onChange={(e) => setFormData({ ...formData, global_category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge matni
                </label>
                <input
                  type="text"
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                  placeholder="Masalan: -15%, Top, Yangi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holat
                </label>
                <select
                  value={formData.is_available ? 'available' : 'unavailable'}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'available' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                >
                  <option value="available">Mavjud</option>
                  <option value="unavailable">Mavjud emas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rasm
              </label>
              <ImageUpload
                bucket="dishes"
                currentImageUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                onUploadError={(err) => setError(err)}
                label="Rasm yuklash"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Saqlanmoqda...' : editingDish ? 'Saqlash' : 'Qo\'shish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingDish(null)
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    badge_text: '',
                    global_category_id: '',
                    is_available: true,
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список товаров */}
      {filteredDishes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
          <p className="text-gray-500">
            {searchQuery || filterAvailable !== 'all' 
              ? 'Qidiruv natijalari topilmadi' 
              : 'Mahsulotlar hozircha yo\'q'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
              {dish.image_url && (
                <div className="mb-3 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex-1">
                  {dish.name}
                </h3>
                {dish.badge_text && (
                  <span className="ml-2 px-2 py-1 bg-black text-white text-xs font-medium rounded">
                    {dish.badge_text}
                  </span>
                )}
              </div>
              {dish.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {dish.description}
                </p>
              )}
              {dish.global_categories && (
                <p className="text-xs text-gray-500 mb-2">
                  {dish.global_categories.name}
                </p>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {Number(dish.price).toLocaleString('ru-RU')} so'm
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    dish.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dish.is_available ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dish)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleToggleAvailable(dish.id, dish.is_available)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      dish.is_available
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                        : 'bg-green-100 hover:bg-green-200 text-green-800'
                    }`}
                  >
                    {dish.is_available ? 'Yashirish' : 'Ko\'rsatish'}
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    disabled={deleting === dish.id}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === dish.id ? '...' : 'O\'chirish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

