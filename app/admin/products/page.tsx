import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { ProductsList } from '@/components/admin/ProductsList'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
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

  // Загружаем все продукты с информацией о складах и категориях
  const { data: products } = await supabase
    .from('dishes')
    .select(`
      *,
      categories (
        id,
        name,
        restaurant_id
      ),
      restaurants (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Загружаем все склады для фильтрации
  const { data: warehouses } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Mahsulotlarni boshqarish
            </h1>
          </div>
          <div className="flex gap-2 md:gap-3">
            <a
              href="/admin/products/categories"
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <span>📂</span>
              <span className="hidden md:inline">Faol kategoriyalar</span>
              <span className="md:hidden">Kategoriyalar</span>
            </a>
            <a
              href="/admin/products/new"
              className="bg-black hover:bg-gray-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <span>+</span>
              <span>Yangi mahsulot</span>
            </a>
          </div>
        </div>

        <ProductsList 
          products={products || []} 
          warehouses={warehouses || []}
        />
      </div>
    </div>
  )
}

