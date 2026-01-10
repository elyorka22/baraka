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

  // Загружаем все доступные товары для главной страницы
  const { data: products } = await supabase
    .from('dishes')
    .select(`
      *,
      restaurants (
        id,
        name
      )
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mahsulotlar</h1>
          <p className="text-gray-600">Eng yaxshi mahsulotlarni uyingizga yetkazib beramiz</p>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">Hozircha mahsulotlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-32 md:h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <span className="text-4xl md:text-6xl">📦</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-green-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold">
                    Mavjud
                  </div>
                </div>
                <div className="p-3 md:p-5">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 hidden md:block">
                      {product.description}
                    </p>
                  )}
                  {product.restaurants && (
                    <p className="text-xs text-gray-500 mb-2 md:mb-3 line-clamp-1">
                      {product.restaurants.name}
                    </p>
                  )}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <span className="text-lg md:text-2xl font-bold text-green-600">
                      {product.price} ₽
                    </span>
                    <Link
                      href={`/customer/product/${product.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm font-semibold text-center"
                    >
                      Batafsil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
