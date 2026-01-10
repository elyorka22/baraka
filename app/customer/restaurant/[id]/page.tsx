'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LogoutButton } from '@/components/common/LogoutButton'

export default function RestaurantMenuPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [restaurant, setRestaurant] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      
      // Загружаем склад
      const { data: warehouseData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (warehouseData) {
        setRestaurant(warehouseData)
      }

      // Загружаем категории
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Загружаем продукты
      const { data: dishesData } = await supabase
        .from('dishes')
        .select('*, categories(*)')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('name')

      if (dishesData) {
        setDishes(dishesData)
      }

      // Загружаем корзину из localStorage (общая корзина)
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        // Фильтруем только продукты этого склада
        const filteredCart: Record<string, number> = {}
        Object.keys(cartData).forEach(dishId => {
          if (cartData[dishId].restaurantId === restaurantId) {
            filteredCart[dishId] = cartData[dishId].quantity
          }
        })
        setCart(filteredCart)
      }

      setLoading(false)
    }

    loadData()
  }, [restaurantId])

  const addToCart = (dishId: string) => {
    const newCart = { ...cart, [dishId]: (cart[dishId] || 0) + 1 }
    setCart(newCart)
    
    // Сохраняем в общую корзину с информацией о складе
    const savedCart = localStorage.getItem('cart')
    const cartData = savedCart ? JSON.parse(savedCart) : {}
    cartData[dishId] = { quantity: newCart[dishId], restaurantId }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }

  const removeFromCart = (dishId: string) => {
    const newCart = { ...cart }
    if (newCart[dishId] > 1) {
      newCart[dishId] -= 1
    } else {
      delete newCart[dishId]
    }
    setCart(newCart)
    
    // Обновляем общую корзину
    const savedCart = localStorage.getItem('cart')
    const cartData = savedCart ? JSON.parse(savedCart) : {}
    if (newCart[dishId]) {
      cartData[dishId] = { quantity: newCart[dishId], restaurantId }
    } else {
      delete cartData[dishId]
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find(d => d.id === dishId)
      return total + (dish ? dish.price * quantity : 0)
    }, 0)
  }

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Ombor topilmadi</div>
      </div>
    )
  }

  const dishesByCategory = categories.map(category => ({
    category,
    dishes: dishes.filter(d => d.category_id === category.id)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/customer" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
            <div className="flex space-x-4 items-center">
              <Link
                href="/customer/cart"
                className="relative text-gray-700 hover:text-orange-500"
              >
                Savat
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/customer" className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors">
            <span>←</span> Omborlarga qaytish
          </Link>
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🏪</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                {restaurant.description && (
                  <p className="text-gray-600">{restaurant.description}</p>
                )}
                {restaurant.address && (
                  <div className="flex items-center text-gray-500 text-sm mt-3">
                    <span className="mr-2">📍</span>
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {dishesByCategory.map(({ category, dishes: categoryDishes }) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-green-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="relative">
                    {dish.image_url ? (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}
                    {dish.is_available && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Mavjud
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{dish.name}</h3>
                    {dish.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-green-600">{dish.price}</span>
                        <span className="text-gray-500 text-sm ml-1">so'm</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {cart[dish.id] > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(dish.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-9 h-9 rounded-lg flex items-center justify-center font-semibold transition-colors"
                            >
                              −
                            </button>
                            <span className="font-bold text-gray-900 w-8 text-center">{cart[dish.id]}</span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(dish.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
                        >
                          {cart[dish.id] > 0 ? (
                            <>
                              <span>+</span>
                            </>
                          ) : (
                            <>
                              <span>🛒</span>
                              <span>Qo'shish</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {getCartCount() > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-green-600 p-4 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">🛒</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Savatdagi mahsulotlar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getCartCount()} <span className="text-lg text-gray-500">ta</span>
                  </p>
                  <p className="text-lg font-semibold text-green-600">Jami: {getCartTotal()} so'm</p>
                </div>
              </div>
              <Link
                href="/customer/cart"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg flex items-center gap-2"
              >
                <span>Buyurtma berish</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

