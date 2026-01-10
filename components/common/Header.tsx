'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { LogoutButton } from './LogoutButton'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors relative"
                >
                  Savat
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
                  href="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

