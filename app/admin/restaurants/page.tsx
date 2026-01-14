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
    .select('*, profiles!restaurants_manager_id_fkey(id, full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Omborlarni boshqarish
            </h1>
          </div>
          <a
            href="/admin/restaurants/new"
            className="bg-black hover:bg-gray-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
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

