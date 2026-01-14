import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

export const dynamic = 'force-dynamic'

export default async function CreateUserPage() {
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

  // Загружаем список складов для выбора
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a
            href="/admin/users"
            className="text-gray-900 hover:text-gray-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <span>←</span> Foydalanuvchilar ro'yxatiga qaytish
          </a>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Yangi foydalanuvchi qo'shish
          </h1>
          <p className="text-gray-600 mt-1">
            Email va parol orqali yangi foydalanuvchi yarating
          </p>
        </div>

        <CreateUserForm restaurants={restaurants || []} />
      </div>
    </div>
  )
}

