import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditBannerForm } from '@/components/admin/EditBannerForm'

export const dynamic = 'force-dynamic'

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: banner } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .single()

  if (!banner) {
    redirect('/admin/banners')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Bannerni tahrirlash
            </h1>
            <p className="text-gray-600">Banner ma'lumotlarini o'zgartiring</p>
          </div>
          <EditBannerForm banner={banner} />
        </div>
      </div>
    </div>
  )
}

