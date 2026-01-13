'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Header } from '@/components/common/Header'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<Record<string, { quantity: number; restaurantId: string }>>({})
  const [dishes, setDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      // Авторизация не обязательна для корзины
      if (currentUser) {
        setUser(currentUser)
      }

      // Загружаем корзину из localStorage
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)

        // Загружаем информацию о продуктах
        const dishIds = Object.keys(cartData)
        if (dishIds.length > 0) {
          const { data: dishesData } = await supabase
            .from('dishes')
            .select('*, restaurants(id, name)')
            .in('id', dishIds)

          if (dishesData) {
            setDishes(dishesData)
          }
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const updateQuantity = (dishId: string, change: number) => {
    const newCart = { ...cart }
    if (!newCart[dishId]) return

    const newQuantity = newCart[dishId].quantity + change
    if (newQuantity <= 0) {
      delete newCart[dishId]
    } else {
      newCart[dishId] = { ...newCart[dishId], quantity: newQuantity }
    }

    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeItem = (dishId: string) => {
    const newCart = { ...cart }
    delete newCart[dishId]
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const getTotal = () => {
    return dishes.reduce((total, dish) => {
      const quantity = cart[dish.id]?.quantity || 0
      return total + dish.price * quantity
    }, 0)
  }

  const getRestaurantId = () => {
    if (dishes.length === 0) return null
    return dishes[0].restaurant_id
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

  if (dishes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-4">Savat bo'sh</p>
            <Link
              href="/"
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Mahsulotlarga o'tish
            </Link>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Savat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 space-y-3 md:space-y-4 border border-gray-100">
              {dishes.map((dish) => {
                // Определяем единицу измерения
                const getUnit = () => {
                  if (dish.description?.toLowerCase().includes('kg') || dish.description?.toLowerCase().includes('килограмм')) {
                    return 'kg'
                  }
                  if (dish.description?.toLowerCase().includes('dona') || dish.description?.toLowerCase().includes('шт')) {
                    return 'dona'
                  }
                  return 'dona'
                }
                const unit = getUnit()
                const quantity = cart[dish.id]?.quantity || 0
                
                return (
                  <div key={dish.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Изображение товара */}
                    <div className="relative w-full md:w-32 h-32 md:h-32 bg-white flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
                      {dish.image_url ? (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-3xl">📦</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Информация о товаре */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="text-gray-500 text-xs mb-2 line-clamp-1">
                            {dish.description}
                          </p>
                        )}
                        <p className="text-sm font-bold text-gray-900">
                          {Number(dish.price).toLocaleString('ru-RU')} so'm / {unit}
                        </p>
                      </div>
                      
                      {/* Кнопки управления количеством */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm px-1.5 py-1 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-6 h-6 rounded flex items-center justify-center font-semibold text-sm transition-colors"
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-900 w-5 text-center text-xs">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            className="bg-black hover:bg-gray-800 text-white w-6 h-6 rounded flex items-center justify-center font-semibold text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(dish.id)}
                          className="text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors"
                          title="O'chirish"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-4 border border-gray-100">
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Jami</h2>
              </div>
              <div className="space-y-2 mb-4 md:mb-6">
                {dishes.map((dish) => {
                  const quantity = cart[dish.id]?.quantity || 0
                  return (
                    <div key={dish.id} className="flex justify-between text-xs md:text-sm text-gray-600">
                      <span className="truncate mr-2 flex-1">{dish.name} × {quantity}</span>
                      <span className="font-semibold whitespace-nowrap text-gray-900">{Number(dish.price * quantity).toLocaleString('ru-RU')} so'm</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gray-200 pt-3 md:pt-4 mb-4 md:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-semibold text-gray-900">Jami:</span>
                  <span className="text-lg md:text-xl font-bold text-gray-900">{Number(getTotal()).toLocaleString('ru-RU')} so'm</span>
                </div>
              </div>
              <Link
                href={`/customer/checkout?restaurant=${getRestaurantId()}`}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-colors block text-center shadow-sm flex items-center justify-center gap-2"
              >
                <span>Buyurtma berish</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

