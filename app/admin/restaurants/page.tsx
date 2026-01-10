import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { RestaurantsList } from '@/components/admin/RestaurantsList'

export const dynamic = 'force-dynamic'

export default async function AdminRestaurantsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    redirect('/')
  }

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Omborlarni boshqarish
            </h1>
            <p className="text-gray-600">Mahsulotlar omborlarini qo'shing va tahrirlang</p>
          </div>
          <a
            href="/admin/restaurants/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2"
          >
            <span>+</span>
            <span>Ombor qo'shish</span>
          </a>
        </div>

        <RestaurantsList restaurants={restaurants || []} />
      </div>
    </div>
  )
}

