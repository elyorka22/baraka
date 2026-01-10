'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LogoutButton } from '@/components/common/LogoutButton'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      
      // Проверяем авторизацию
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
      }

      // Загружаем продукт
      const { data: productData } = await supabase
        .from('dishes')
        .select(`
          *,
          restaurants (
            id,
            name,
            address,
            phone
          )
        `)
        .eq('id', productId)
        .eq('is_available', true)
        .single()

      if (productData) {
        setProduct(productData)
      }

      // Загружаем корзину
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)
      }

      setLoading(false)
    }

    loadData()
  }, [productId])

  const addToCart = (dishId: string) => {
    const newCart = { ...cart, [dishId]: (cart[dishId] || 0) + 1 }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeFromCart = (dishId: string) => {
    const newCart = { ...cart }
    if (newCart[dishId] > 1) {
      newCart[dishId] = newCart[dishId] - 1
    } else {
      delete newCart[dishId]
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">Mahsulot topilmadi</p>
          <Link href="/" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
            <div className="flex space-x-4 items-center">
              {user && <LogoutButton />}
              <Link
                href="/customer/cart"
                className="relative text-gray-700 hover:text-green-600"
              >
                <span className="text-2xl">🛒</span>
                {Object.keys(cart).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {Object.values(cart).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors">
            <span>←</span> Bosh sahifaga qaytish
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                <span className="text-9xl">📦</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {product.description && (
              <p className="text-gray-600 text-lg mb-6">{product.description}</p>
            )}

            {product.restaurants && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Ombor</p>
                <p className="font-semibold text-gray-900">{product.restaurants.name}</p>
                {product.restaurants.address && (
                  <p className="text-sm text-gray-600 mt-1">📍 {product.restaurants.address}</p>
                )}
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">Narxi</p>
              <p className="text-4xl font-bold text-green-600">{product.price} so'm</p>
            </div>

            <div className="flex items-center space-x-4">
              {cart[product.id] > 0 && (
                <>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="font-bold text-gray-900 text-xl w-12 text-center">{cart[product.id]}</span>
                </>
              )}
              <button
                onClick={() => addToCart(product.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>{cart[product.id] > 0 ? 'Qo\'shish' : 'Savatga qo\'shish'}</span>
              </button>
            </div>

            {cart[product.id] > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Savatda: <span className="font-semibold">{cart[product.id]}</span> dona
                </p>
                <p className="text-lg font-bold text-gray-900">
                  Jami: {product.price * cart[product.id]} so'm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

