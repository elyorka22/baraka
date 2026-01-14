import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendOrderNotification } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { orderId, chatId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Если передан chatId, используем его вместо chat_id из склада
    const targetChatId = chatId

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

    // Определяем chat_id для отправки
    const restaurant = order.restaurants
    const finalChatId = targetChatId || restaurant?.telegram_chat_id

    if (!finalChatId) {
      return NextResponse.json({ error: 'Telegram chat ID is required' }, { status: 400 })
    }

    // Формируем данные для уведомления
    const notification: Parameters<typeof sendOrderNotification>[1] = {
      orderId: order.id,
      restaurantName: restaurant?.name || 'Noma\'lum ombor',
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
    const result = await sendOrderNotification(finalChatId, notification)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Не удалось отправить уведомление в Telegram',
        details: {
          chatId: finalChatId,
          orderId: order.id,
        }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Уведомление успешно отправлено в Telegram'
    })
  } catch (error: any) {
    console.error('Error sending Telegram notification:', error)
    return NextResponse.json({ 
      error: error.message || 'Внутренняя ошибка сервера',
      details: error.stack
    }, { status: 500 })
  }
}

