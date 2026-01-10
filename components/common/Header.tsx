'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { LogoutButton } from './LogoutButton'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  // Загружаем количество товаров в корзине
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart)
          const total = Object.values(cartData).reduce((sum: number, item: any) => {
            return sum + (item.quantity || 0)
          }, 0)
          setCartCount(total)
        } catch {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    // Загружаем при монтировании
    updateCartCount()

    // Слушаем изменения localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCartCount()
      }
    }

    // Слушаем кастомное событие для обновления корзины в том же окне
    const handleCartUpdate = () => {
      updateCartCount()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCartUpdate)

    // Проверяем корзину периодически (на случай изменений в других вкладках)
    const interval = setInterval(updateCartCount, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              Baraka
            </Link>
            <div className="flex space-x-4 items-center">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            Baraka
          </Link>
          <div className="flex space-x-4 items-center">
            {user ? (
              <>
                <Link
                  href="/customer/orders"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Mening buyurtmalarim
                </Link>
                <Link
                  href="/customer/cart"
                  className="relative text-gray-700 hover:text-green-600 transition-colors"
                >
                  <span className="text-2xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/customer/cart"
                  className="relative text-gray-700 hover:text-green-600 transition-colors"
                >
                  <span className="text-2xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

