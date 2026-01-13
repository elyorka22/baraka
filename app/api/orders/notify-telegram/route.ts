import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendOrderNotification } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Загружаем заказ с полной информацией
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (
          id,
          name,
          telegram_chat_id
        ),
        order_items (
          *,
          dishes (
            name,
            price
          )
        ),
        profiles (
          full_name
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, есть ли telegram_chat_id у склада
    const restaurant = order.restaurants
    if (!restaurant?.telegram_chat_id) {
      return NextResponse.json({ success: true, message: 'No Telegram chat ID configured' })
    }

    // Формируем данные для уведомления
    const notification: Parameters<typeof sendOrderNotification>[1] = {
      orderId: order.id,
      restaurantName: restaurant.name,
      customerName: order.profiles?.full_name || order.phone || 'Noma\'lum mijoz',
      address: order.address,
      totalPrice: order.total_price,
      items: order.order_items.map((item: any) => ({
        name: item.dishes?.name || 'Noma\'lum mahsulot',
        quantity: item.quantity,
        price: item.price,
      })),
    }

    // Отправляем уведомление
    await sendOrderNotification(restaurant.telegram_chat_id, notification)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending Telegram notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

