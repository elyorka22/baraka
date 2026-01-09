import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditDishForm } from '@/components/admin/EditDishForm'

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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Редактировать блюдо
          </h1>
          <EditDishForm dish={dish} categories={categories || []} restaurantId={id} />
        </div>
      </div>
    </div>
  )
}

