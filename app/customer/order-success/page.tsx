'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

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

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyurtma muvaffaqiyatli berildi!</h1>
            {orderId && (
              <p className="text-gray-600 mb-4">
                Buyurtma raqami: <span className="font-semibold">{orderId}</span>
              </p>
            )}
            <p className="text-gray-600">
              Buyurtmani tasdiqlash uchun tez orada siz bilan bog'lanamiz.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Keyin nima bo'ladi?</h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Menejer buyurtmangizni tekshiradi va yig'uvchini tayinlaydi</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Buyurtma yig'ilgandan keyin kuryer uni ko'rsatilgan manzilga yetkazadi</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Siz ko'rsatilgan email yoki telefon raqamiga xabarnoma olasiz</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Restoranlarga qaytish
            </Link>
            <Link
              href="/auth/register"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Buyurtmalarni kuzatish uchun ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

