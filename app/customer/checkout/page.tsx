'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant')
  const [cart, setCart] = useState<Record<string, { quantity: number; restaurantId: string }>>({})
  const [dishes, setDishes] = useState<any[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (currentUser) {
        setUser(currentUser)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFormData({
            address: '',
            phone: profileData.phone || '',
            email: currentUser.email || '',
            notes: '',
          })
        }
      }

      // Загружаем корзину
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)

        const dishIds = Object.keys(cartData)
        if (dishIds.length > 0) {
          const { data: dishesData } = await supabase
            .from('dishes')
            .select('*, restaurants(*)')
            .in('id', dishIds)

          if (dishesData) {
            setDishes(dishesData)
            if (dishesData[0]?.restaurants) {
              setRestaurant(dishesData[0].restaurants)
            }
            // Определяем restaurantId из корзины, если не передан в URL
            if (!restaurantId && dishesData.length > 0) {
              const firstDish = dishesData[0]
              const cartItem = cartData[firstDish.id]
              if (cartItem?.restaurantId) {
                // Обновляем URL с restaurantId
                router.replace(`/customer/checkout?restaurant=${cartItem.restaurantId}`)
              } else if (firstDish.restaurant_id) {
                router.replace(`/customer/checkout?restaurant=${firstDish.restaurant_id}`)
              }
            }
          }
        }
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const getTotal = () => {
    return dishes.reduce((total, dish) => {
      const quantity = cart[dish.id]?.quantity || 0
      return total + dish.price * quantity
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Определяем restaurantId из корзины или из URL
    const finalRestaurantId = restaurantId || dishes[0]?.restaurant_id || cart[Object.keys(cart)[0]]?.restaurantId
    
    if (!finalRestaurantId || !restaurant) {
      setError('Xatolik: ombor topilmadi')
      setSubmitting(false)
      return
    }

    if (dishes.length === 0) {
      setError('Savat bo\'sh')
      setSubmitting(false)
      return
    }

    const supabase = createSupabaseClient()

    // Создаем заказ (user_id может быть NULL для анонимных заказов)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        restaurant_id: finalRestaurantId,
        status: 'pending',
        total_price: getTotal(),
        address: formData.address,
        phone: formData.phone,
        customer_email: formData.email || null,
        notes: formData.notes || null,
      }])
      .select()
      .single()

    if (orderError || !order) {
      setError(orderError?.message || 'Ошибка при создании заказа')
      setSubmitting(false)
      return
    }

    // Создаем позиции заказа
    const orderItems = dishes.map(dish => ({
      order_id: order.id,
      dish_id: dish.id,
      quantity: cart[dish.id]?.quantity || 0,
      price: dish.price,
    })).filter(item => item.quantity > 0)

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      setError(itemsError.message)
      setSubmitting(false)
      return
    }

    // Очищаем корзину
    localStorage.removeItem('cart')

    // Перенаправляем на страницу заказов (или на главную для анонимных пользователей)
    if (user) {
      router.push('/customer/orders')
    } else {
      // Для анонимных пользователей показываем сообщение об успехе
      router.push(`/customer/order-success?id=${order.id}`)
    }
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
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
          <Link href="/customer" className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            Baraka
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buyurtma berish</h1>
          <p className="text-gray-600">Ma'lumotlaringizni to'ldiring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-100">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Yetkazib berish manzili *
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="Ko'cha, uy, kvartira"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="+998 (99) 123-45-67"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email {!user && '*'}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required={!user}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="your@email.com"
                />
                {!user && (
                  <p className="mt-1 text-sm text-gray-500">
                    Email buyurtma holati haqida xabarnoma olish uchun kerak
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Izohlar
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="Kuryer uchun qo'shimcha ma'lumot"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {submitting ? 'Buyurtma berilmoqda...' : 'Buyurtma berish'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <span className="text-xl">🛒</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Sizning buyurtmangiz</h2>
              </div>
              {restaurant && (
                <p className="text-sm text-gray-500 mb-4">{restaurant.name}</p>
              )}
              <div className="space-y-2 mb-6">
                {dishes.map((dish) => {
                  const quantity = cart[dish.id]?.quantity || 0
                  if (quantity === 0) return null
                  return (
                    <div key={dish.id} className="flex justify-between text-sm">
                      <span>{dish.name} × {quantity}</span>
                      <span>{Number(dish.price * quantity).toLocaleString('ru-RU')} so'm</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Jami:</span>
                  <span className="text-2xl font-bold text-green-600">{Number(getTotal()).toLocaleString('ru-RU')} so'm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

