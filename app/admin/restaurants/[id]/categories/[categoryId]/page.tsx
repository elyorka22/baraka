import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditCategoryForm } from '@/components/admin/EditCategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string }>
}) {
  const { id, categoryId } = await params
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

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (!category) {
    redirect(`/admin/restaurants/${id}/dishes`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Редактировать категорию
          </h1>
          <EditCategoryForm category={category} restaurantId={id} />
        </div>
      </div>
    </div>
  )
}

