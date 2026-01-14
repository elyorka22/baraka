import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { AdminOrdersList } from '@/components/admin/AdminOrdersList'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
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

  // Загружаем все заказы с полной информацией
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      restaurants (
        id,
        name
      ),
      profiles!orders_user_id_fkey (
        full_name,
        phone
      ),
      order_items (
        *,
        dishes (
          name,
          price
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Загружаем склады с настроенными Telegram ботами
  const { data: restaurantsWithBots } = await supabase
    .from('restaurants')
    .select('id, name, telegram_chat_id')
    .not('telegram_chat_id', 'is', null)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Buyurtmalarni boshqarish
          </h1>
          <p className="text-gray-600 mt-1">
            Barcha buyurtmalarni ko'ring va boshqaring
          </p>
        </div>

        <AdminOrdersList 
          orders={orders || []} 
          restaurantsWithBots={restaurantsWithBots || []}
        />
      </div>
    </div>
  )
}

