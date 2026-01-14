'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
}

interface CreateUserFormProps {
  restaurants: Restaurant[]
}

export function CreateUserForm({ restaurants }: CreateUserFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'manager' as 'manager' | 'collector' | 'courier' | 'customer',
    restaurant_id: '' as string | ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Валидация
    if (!formData.email || !formData.password) {
      setError('Email va parol majburiy')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi')
      return
    }

    if (formData.password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo\'lishi kerak')
      return
    }

    // Для менеджеров склад обязателен
    if (formData.role === 'manager' && !formData.restaurant_id) {
      setError('Menejer uchun ombor tanlash majburiy')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          role: formData.role,
          restaurant_id: formData.role === 'manager' ? formData.restaurant_id : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Foydalanuvchi yaratishda xatolik yuz berdi')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Foydalanuvchi muvaffaqiyatli yaratildi! Foydalanuvchi email va parol bilan tizimga kirishi mumkin.
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="masalan@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Parol <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Kamida 6 belgi"
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Parolni tasdiqlash <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Parolni qayta kiriting"
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Rol <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          required
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        >
          <option value="manager">Menejer</option>
          <option value="collector">Yig'uvchi</option>
          <option value="courier">Kuryer</option>
          <option value="customer">Mijoz</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Menejerlar buyurtmalarni boshqarish va yig'uvchilar va kuryerlarni tayinlash huquqiga ega
        </p>
      </div>

      {formData.role === 'manager' && (
        <div>
          <label htmlFor="restaurant_id" className="block text-sm font-medium text-gray-700 mb-2">
            Ombor <span className="text-red-500">*</span>
          </label>
          <select
            id="restaurant_id"
            name="restaurant_id"
            required={formData.role === 'manager'}
            value={formData.restaurant_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
          >
            <option value="">Omborni tanlang</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Menejer ushbu omborga bog'lanadi va faqat uning ma'lumotlarini ko'ra oladi
          </p>
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
          To'liq ism
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Masalan: Aliyev Vali"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Telefon raqami
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+998901234567"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Yaratilmoqda...' : 'Yaratish'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  )
}

