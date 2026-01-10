import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/common/Header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Редиректим авторизованных пользователей с ролями на их страницы
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const role = profile.role
      if (role === 'super_admin') redirect('/admin/dashboard')
      if (role === 'manager') redirect('/manager/dashboard')
      if (role === 'collector') redirect('/collector/orders')
      if (role === 'courier') redirect('/courier/orders')
      // Для клиентов и неавторизованных - показываем меню ресторанов
    }
  }

  // Загружаем склады для главной страницы
  const { data: warehouses } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mahsulotlar yetkazib berish</h1>
          <p className="text-gray-600">Eng yaxshi mahsulotlarni uyingizga yetkazib beramiz</p>
        </div>

        {!warehouses || warehouses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <Link
                key={warehouse.id}
                href={`/customer/restaurant/${warehouse.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative">
                  {warehouse.image_url ? (
                    <img
                      src={warehouse.image_url}
                      alt={warehouse.name}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <span className="text-6xl">🏪</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Faol
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {warehouse.name}
                    </h3>
                    <span className="text-2xl">🛒</span>
                  </div>
                  {warehouse.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {warehouse.description}
                    </p>
                  )}
                  {warehouse.address && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="mr-2">📍</span>
                      <span>{warehouse.address}</span>
                    </div>
                  )}
                  {warehouse.phone && (
                    <div className="flex items-center text-gray-500 text-sm mt-2">
                      <span className="mr-2">📞</span>
                      <span>{warehouse.phone}</span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-green-600 font-semibold text-sm">Mahsulotlarni ko'rish →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
