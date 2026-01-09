import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  // Загружаем рестораны и баннеры для главной страницы
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('position')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-orange-500">
              Baraka
            </Link>
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link
                    href="/customer/orders"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Mening buyurtmalarim
                  </Link>
                  <Link
                    href="/customer/cart"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Savat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Kirish
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {banners && banners.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">{banner.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Restoranlar</h1>

        {!restaurants || restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Hozircha restoranlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/customer/restaurant/${restaurant.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  {restaurant.address && (
                    <p className="text-gray-500 text-sm">
                      📍 {restaurant.address}
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
