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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Omborlar</h1>

        {!warehouses || warehouses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Hozircha omborlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <Link
                key={warehouse.id}
                href={`/customer/restaurant/${warehouse.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {warehouse.image_url && (
                  <img
                    src={warehouse.image_url}
                    alt={warehouse.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {warehouse.name}
                  </h3>
                  {warehouse.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {warehouse.description}
                    </p>
                  )}
                  {warehouse.address && (
                    <p className="text-gray-500 text-sm">
                      📍 {warehouse.address}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
