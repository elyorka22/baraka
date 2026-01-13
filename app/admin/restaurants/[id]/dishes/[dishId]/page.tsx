import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditDishForm } from '@/components/admin/EditDishForm'

export const dynamic = 'force-dynamic'

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string; dishId: string }>
}) {
  const { id, dishId } = await params
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

  const { data: dish } = await supabase
    .from('dishes')
    .select('*')
    .eq('id', dishId)
    .single()

  if (!dish) {
    redirect(`/admin/restaurants/${id}/dishes`)
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', id)
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Mahsulotni tahrirlash
            </h1>
            <p className="text-gray-600">Mahsulot ma'lumotlarini o'zgartiring</p>
          </div>
          <EditDishForm dish={dish} categories={categories || []} restaurantId={id} />
        </div>
      </div>
    </div>
  )
}

