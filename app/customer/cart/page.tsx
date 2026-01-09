'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Загружаем корзину из localStorage
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)

        // Загружаем информацию о блюдах
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
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/customer" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Корзина пуста</p>
            <Link
              href="/customer"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Перейти к ресторанам
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
          <Link href="/customer" className="text-2xl font-bold text-orange-500">
            Baraka
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              {dishes.map((dish) => (
                <div key={dish.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                  {dish.image_url && (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                    <p className="text-sm text-gray-500">{dish.restaurants?.name}</p>
                    <p className="text-lg font-bold text-orange-500 mt-1">
                      {dish.price} ₽
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(dish.id, -1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold w-8 text-center">
                      {cart[dish.id]?.quantity || 0}
                    </span>
                    <button
                      onClick={() => updateQuantity(dish.id, 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(dish.id)}
                      className="text-red-500 hover:text-red-600 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Итого</h2>
              <div className="space-y-2 mb-6">
                {dishes.map((dish) => {
                  const quantity = cart[dish.id]?.quantity || 0
                  return (
                    <div key={dish.id} className="flex justify-between text-sm">
                      <span>{dish.name} × {quantity}</span>
                      <span>{dish.price * quantity} ₽</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Итого:</span>
                  <span className="text-orange-500">{getTotal()} ₽</span>
                </div>
              </div>
              <Link
                href={`/customer/checkout?restaurant=${getRestaurantId()}`}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors block text-center"
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

