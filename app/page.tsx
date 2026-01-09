import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      if (role === 'customer') {
        // Остаемся на главной для клиентов
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Baraka
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Система доставки еды
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {!user ? (
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Зарегистрироваться
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-700 mb-4">
                Добро пожаловать!
              </p>
              <Link
                href="/customer"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Перейти к меню
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
