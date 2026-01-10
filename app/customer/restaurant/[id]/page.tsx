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
          <Link href="/customer" className="text-orange-500 hover:text-orange-600 mb-4 inline-block">
            ← Omborlarga qaytish
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-gray-600 mt-2">{restaurant.description}</p>
          )}
        </div>

        {dishesByCategory.map(({ category, dishes: categoryDishes }) => (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {dish.image_url && (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{dish.name}</h3>
                    {dish.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-500">{dish.price} ₽</span>
                      <div className="flex items-center space-x-2">
                        {cart[dish.id] > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(dish.id)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-semibold">{cart[dish.id]}</span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(dish.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {cart[dish.id] > 0 ? '+' : 'Savatga qo\'shish'}
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
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Savatdagi mahsulotlar: {getCartCount()}</p>
                <p className="text-xl font-bold text-gray-900">Jami: {getCartTotal()} ₽</p>
              </div>
              <Link
                href="/customer/cart"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Buyurtma berishga o'tish
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

