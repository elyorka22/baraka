'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/common/Navbar'
import { OrdersManagement } from '@/components/manager/OrdersManagement'
import { useRouter } from 'next/navigation'

export default function ManagerOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileData || (profileData.role !== 'manager' && profileData.role !== 'super_admin')) {
        router.push('/')
        return
      }

      setUser(currentUser)
      setProfile(profileData)

      // Загружаем заказы
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (name),
          profiles!orders_user_id_fkey (full_name, phone)
        `)
        .order('created_at', { ascending: false })

      if (ordersData) {
        setOrders(ordersData)
      }

      setLoading(false)

      // Подписка на изменения заказов через Realtime
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('Order change:', payload)
            // Обновляем список заказов
            loadOrders()
          }
        )
        .subscribe()

      const loadOrders = async () => {
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            restaurants (name),
            profiles!orders_user_id_fkey (full_name, phone)
          `)
          .order('created_at', { ascending: false })
        
        if (ordersData) {
          setOrders(ordersData)
        }
      }

      return () => {
        supabase.removeChannel(channel)
      }
    }

    loadData()
  }, [router])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="manager" userName={profile.full_name || user.email || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Управление заказами
        </h1>

        <OrdersManagement orders={orders} />
      </div>
    </div>
  )
}


