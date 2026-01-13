import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditCategoryForm } from '@/components/admin/EditCategoryForm'

export const dynamic = 'force-dynamic'

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
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Kategoriyani tahrirlash
            </h1>
            <p className="text-gray-600">Kategoriya ma'lumotlarini o'zgartiring</p>
          </div>
          <EditCategoryForm category={category} restaurantId={id} />
        </div>
      </div>
    </div>
  )
}

