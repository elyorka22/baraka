'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/database.types'
import { useState, useEffect } from 'react'

interface NavbarProps {
  role: UserRole
  userName?: string
}

export function Navbar({ role, userName }: NavbarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getNavLinks = () => {
    switch (role) {
      case 'super_admin':
        return [
          { href: '/admin/dashboard', label: 'Boshqaruv paneli' },
          { href: '/admin/users', label: 'Foydalanuvchilar' },
          { href: '/admin/restaurants', label: 'Restoranlar' },
          { href: '/admin/banners', label: 'Bannerlar' },
          { href: '/admin/orders', label: 'Buyurtmalar' },
        ]
      case 'manager':
        return [
          { href: '/manager/dashboard', label: 'Boshqaruv paneli' },
          { href: '/manager/orders', label: 'Buyurtmalar' },
          { href: '/manager/collectors', label: 'Yig\'uvchilar' },
          { href: '/manager/couriers', label: 'Kuryerlar' },
        ]
      case 'collector':
        return [
          { href: '/collector/orders', label: 'Mening buyurtmalarim' },
        ]
      case 'courier':
        return [
          { href: '/courier/orders', label: 'Mavjud buyurtmalar' },
        ]
      default:
        return []
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
            <div className="flex space-x-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userName && (
              <span className="text-gray-700 text-sm">
                {userName}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {loading ? 'Chiqilmoqda...' : 'Chiqish'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

