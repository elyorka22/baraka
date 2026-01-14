import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'

export const dynamic = 'force-dynamic'

export default async function ManagerCouriersPage() {
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

  if (!profile || (profile.role !== 'manager' && profile.role !== 'super_admin')) {
    redirect('/')
  }

  // Загружаем список курьеров
  const { data: couriers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'courier')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={profile.role} userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <a
            href="/manager/dashboard"
            className="text-gray-900 hover:text-gray-700 mb-3 md:mb-4 inline-flex items-center gap-2 text-sm md:text-base font-medium transition-colors"
          >
            <span>←</span> Boshqaruv paneliga qaytish
          </a>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Kuryerlar
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Kuryerlar ro'yxati va boshqaruvi
          </p>
        </div>

        {!couriers || couriers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                Kuryerlar hozircha yo'q
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                Hozircha kuryerlar yaratilmagan. Kuryerlarni yaratish uchun super-admin bilan bog'laning.
              </p>
              <a
                href="/manager/dashboard"
                className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Boshqaruv paneliga qaytish
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ism
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {couriers.map((courier) => (
                    <tr key={courier.id}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900">
                          {courier.full_name || 'Ism ko\'rsatilmagan'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {courier.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {courier.phone ? (
                          <a
                            href={`tel:${courier.phone}`}
                            className="text-sm md:text-base text-gray-900 hover:text-blue-600"
                          >
                            {courier.phone}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">Ko'rsatilmagan</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Faol
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

