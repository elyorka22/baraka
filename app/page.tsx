'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Header } from '@/components/common/Header'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<Record<string, { quantity: number; restaurantId: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      
      // Загружаем все доступные товары
      const { data: productsData } = await supabase
        .from('dishes')
        .select(`
          *,
          restaurants (
            id,
            name
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (productsData) {
        setProducts(productsData)
      }

      // Загружаем корзину из localStorage
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const addToCart = (productId: string, restaurantId: string) => {
    const newCart = { ...cart }
    if (!newCart[productId]) {
      newCart[productId] = { quantity: 0, restaurantId }
    }
    newCart[productId].quantity += 1
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    // Отправляем событие для обновления корзины в Header
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeFromCart = (productId: string) => {
    const newCart = { ...cart }
    if (newCart[productId] && newCart[productId].quantity > 1) {
      newCart[productId].quantity -= 1
    } else {
      delete newCart[productId]
    }
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    // Отправляем событие для обновления корзины в Header
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const getQuantity = (productId: string) => {
    return cart[productId]?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-gray-500">Yuklanmoqda...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mahsulotlar</h1>
          <p className="text-gray-600">Eng yaxshi mahsulotlarni uyingizga yetkazib beramiz</p>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">Hozircha mahsulotlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => {
              const quantity = getQuantity(product.id)
              const restaurantId = product.restaurant_id || product.restaurants?.id

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
                >
                <div className="relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 md:h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <span className="text-4xl md:text-6xl">📦</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-green-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold">
                    Mavjud
                  </div>
                  {/* Кнопки управления корзиной на изображении */}
                  <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3">
                    {quantity > 0 ? (
                      <div className="flex items-center space-x-1.5 md:space-x-2 bg-white rounded-lg shadow-lg p-1">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center font-semibold text-sm md:text-base transition-colors"
                        >
                          −
                        </button>
                        <span className="font-bold text-gray-900 w-5 md:w-7 text-center text-xs md:text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(product.id, restaurantId)}
                          className="bg-green-600 hover:bg-green-700 text-white w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center font-semibold text-sm md:text-base transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id, restaurantId)}
                        className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-lg md:text-xl shadow-lg transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3 md:p-5">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 hidden md:block">
                      {product.description}
                    </p>
                  )}
                  {product.restaurants && (
                    <p className="text-xs text-gray-500 mb-2 md:mb-3 line-clamp-1">
                      {product.restaurants.name}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg md:text-2xl font-bold text-green-600">
                      {product.price} ₽
                    </span>
                  </div>
                </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
