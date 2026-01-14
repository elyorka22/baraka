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

  // Загружаем склады
  const { data: restaurants, error: restaurantsError } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (restaurantsError) {
    console.error('Error loading restaurants:', restaurantsError)
  }

  // Загружаем информацию о менеджерах отдельно
  const managerIds = restaurants?.filter(r => r.manager_id).map(r => r.manager_id) || []
  let managersMap: Record<string, { id: string; full_name: string | null; email: string | null }> = {}
  
  if (managerIds.length > 0) {
    const { data: managers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', managerIds)
    
    if (managers) {
      managersMap = managers.reduce((acc, manager) => {
        acc[manager.id] = {
          id: manager.id,
          full_name: manager.full_name,
          email: null // Email нужно получать из auth.users, но для простоты оставим null
        }
        return acc
      }, {} as Record<string, { id: string; full_name: string | null; email: string | null }>)
    }
  }

  // Объединяем данные
  const restaurantsWithManagers = restaurants?.map(restaurant => ({
    ...restaurant,
    profiles: restaurant.manager_id ? managersMap[restaurant.manager_id] || null : null
  })) || []

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

        {restaurantsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Xatolik: {restaurantsError.message}
          </div>
        )}
        <RestaurantsList restaurants={restaurantsWithManagers} />
      </div>
    </div>
  )
}

