'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LogoutButton } from '@/components/common/LogoutButton'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/customer" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-4">Savat bo'sh</p>
            <Link
              href="/customer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Omborlarga o'tish
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/customer" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Savat</h1>
          <p className="text-gray-600">Buyurtmangizni tekshiring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
              {dishes.map((dish) => (
                <div key={dish.id} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📦</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{dish.name}</h3>
                    <p className="text-sm text-gray-500">{dish.restaurants?.name}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      {dish.price} <span className="text-sm text-gray-500">₽</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(dish.id, -1)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors"
                    >
                      −
                    </button>
                    <span className="font-bold text-gray-900 w-10 text-center text-lg">
                      {cart[dish.id]?.quantity || 0}
                    </span>
                    <button
                      onClick={() => updateQuantity(dish.id, 1)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(dish.id)}
                      className="text-red-500 hover:text-red-600 ml-4 text-xl font-bold"
                      title="O'chirish"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Jami</h2>
              </div>
              <div className="space-y-3 mb-6">
                {dishes.map((dish) => {
                  const quantity = cart[dish.id]?.quantity || 0
                  return (
                    <div key={dish.id} className="flex justify-between text-sm text-gray-600">
                      <span>{dish.name} × {quantity}</span>
                      <span className="font-semibold">{dish.price * quantity} ₽</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Jami:</span>
                  <span className="text-2xl font-bold text-green-600">{getTotal()} ₽</span>
                </div>
              </div>
              <Link
                href={`/customer/checkout?restaurant=${getRestaurantId()}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors block text-center shadow-lg flex items-center justify-center gap-2"
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

