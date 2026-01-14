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
          { href: '/admin/restaurants', label: 'Omborlar' },
          { href: '/admin/products', label: 'Mahsulotlar' },
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
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Bazar +
            </Link>
            <div className="flex space-x-2 md:space-x-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-gray-900 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {userName && (
              <span className="text-gray-700 text-xs md:text-sm hidden md:inline">
                {userName}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors"
            >
              {loading ? 'Chiqilmoqda...' : 'Chiqish'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

