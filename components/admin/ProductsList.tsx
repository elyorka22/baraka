'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string
  restaurant_id: string
  categories: {
    id: string
    name: string
    restaurant_id: string
  } | null
  restaurants: {
    id: string
    name: string
  } | null
}

interface ProductsListProps {
  products: Product[]
  warehouses: Array<{ id: string; name: string }>
}

export function ProductsList({ products: initialProducts, warehouses }: ProductsListProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all')
  const [filterAvailable, setFilterAvailable] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_available: !currentStatus } : p
      ))
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
      setProducts(products.filter(p => p.id !== id))
    }
    setDeleting(null)
  }

  // Фильтрация продуктов
  const filteredProducts = products.filter(product => {
    // Фильтр по складу
    if (filterWarehouse !== 'all' && product.restaurant_id !== filterWarehouse) {
      return false
    }

    // Фильтр по доступности
    if (filterAvailable === 'available' && !product.is_available) {
      return false
    }
    if (filterAvailable === 'unavailable' && product.is_available) {
      return false
    }

    // Поиск по названию
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qidirish
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot nomi..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ombor
            </label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">Barcha omborlar</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holati
            </label>
            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">Barchasi</option>
              <option value="available">Mavjud</option>
              <option value="unavailable">Mavjud emas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <p className="text-sm text-gray-600">
          Jami: <span className="font-semibold text-gray-900">{filteredProducts.length}</span> mahsulot
          {filteredProducts.length !== products.length && (
            <span className="ml-2">
              (filtrdan: {products.length})
            </span>
          )}
        </p>
      </div>

      {/* Список продуктов */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">
            {searchQuery || filterWarehouse !== 'all' || filterAvailable !== 'all'
              ? 'Filtrlarga mos mahsulotlar topilmadi'
              : 'Hozircha mahsulotlar yo\'q'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                    product.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_available ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                </div>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Ombor:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.restaurants?.name || 'Noma\'lum'}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Kategoriya:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.categories?.name || 'Kategoriya yo\'q'}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {product.price} ₽
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/admin/restaurants/${product.restaurant_id}/dishes/${product.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors text-center"
                  >
                    Tahrirlash
                  </Link>
                  <button
                    onClick={() => handleToggleAvailable(product.id, product.is_available)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      product.is_available
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    {product.is_available ? 'Yashirish' : 'Ko\'rsatish'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleting === product.id}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {deleting === product.id ? '...' : 'O\'chirish'}
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



