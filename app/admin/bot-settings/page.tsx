import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { BotSettingsForm } from '@/components/admin/BotSettingsForm'

export const dynamic = 'force-dynamic'

export default async function BotSettingsPage() {
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

  // Загружаем настройки бота
  const { data: settings } = await supabase
    .from('bot_settings')
    .select('*')
    .order('key')

  // Преобразуем массив настроек в объект для удобства
  const settingsMap: Record<string, { id: string; value: string; description: string }> = {}
  settings?.forEach(setting => {
    settingsMap[setting.key] = {
      id: setting.id,
      value: setting.value,
      description: setting.description || ''
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="super_admin" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a
            href="/admin/dashboard"
            className="text-gray-900 hover:text-gray-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors"
          >
            <span>←</span> Boshqaruv paneliga qaytish
          </a>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bot sozlamalari
          </h1>
          <p className="text-gray-600 mt-1">
            Telegram bot tugmalari va xabarlarini sozlash
          </p>
        </div>

        <BotSettingsForm initialSettings={settingsMap} />
      </div>
    </div>
  )
}

