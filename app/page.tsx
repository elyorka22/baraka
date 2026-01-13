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

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bizning mahsulotlarimiz</h1>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">Hozircha mahsulotlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((product: any) => {
              const quantity = getQuantity(product.id)
              const restaurantId = product.restaurant_id || product.restaurants?.id
              
              // Определяем единицу измерения из описания или используем по умолчанию
              const getUnit = () => {
                if (product.description?.toLowerCase().includes('kg') || product.description?.toLowerCase().includes('килограмм')) {
                  return 'kg'
                }
                if (product.description?.toLowerCase().includes('dona') || product.description?.toLowerCase().includes('шт')) {
                  return 'dona'
                }
                // По умолчанию используем 'dona'
                return 'dona'
              }
              const unit = getUnit()

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    {/* Кнопка добавления в корзину */}
                    <div className="absolute bottom-2 right-2">
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-1 bg-white rounded-lg shadow-md px-1.5 py-1">
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center font-semibold text-sm transition-colors"
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-900 w-5 text-center text-xs">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(product.id, restaurantId)}
                            className="bg-black hover:bg-gray-800 text-white w-6 h-6 rounded flex items-center justify-center font-semibold text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id, restaurantId)}
                          className="bg-black hover:bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-base shadow-md transition-colors"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-auto">
                      <span className="text-sm font-bold text-gray-900">
                        {Number(product.price).toLocaleString('ru-RU')} so'm / {unit}
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
