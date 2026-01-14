'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/database.types'
import { useState } from 'react'

interface NavbarProps {
  role: UserRole
  userName?: string
}

export function Navbar({ role, userName }: NavbarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          { href: '/admin/bot-settings', label: 'Bot sozlamalari' },
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

  const navLinks = getNavLinks()

  return (
    <>
      {/* Desktop Navbar - скрыт на мобильных */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Bazar +
              </Link>
              <div className="flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {loading ? 'Chiqilmoqda...' : 'Chiqish'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - только на мобильных */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center h-14 px-4">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Bazar +
          </Link>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-gray-700 text-xs truncate max-w-[100px]">
                {userName}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menyu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-700 hover:text-gray-900"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Footer with user info and logout */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                {userName && (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Foydalanuvchi</p>
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Chiqilmoqda...' : 'Chiqish'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

