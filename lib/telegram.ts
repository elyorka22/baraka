/**
 * Функция для отправки уведомлений о заказах в Telegram
 */

interface OrderNotification {
  orderId: string
  restaurantName: string
  customerName: string
  address: string
  totalPrice: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export async function sendOrderNotification(
  chatId: string,
  order: OrderNotification
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    const error = 'TELEGRAM_BOT_TOKEN не установлен в переменных окружения'
    console.error(error)
    return { success: false, error }
  }

  if (!chatId || chatId.trim() === '') {
    const error = 'Chat ID не указан'
    console.error(error)
    return { success: false, error }
  }

  // Валидация Chat ID: должен быть числом (может быть отрицательным для групп)
  const chatIdNum = Number(chatId.trim())
  if (isNaN(chatIdNum)) {
    const error = 'Chat ID должен быть числом'
    console.error(error, { chatId })
    return { success: false, error }
  }

  const message = `🛒 **Yangi buyurtma**

**Buyurtma ID:** ${order.orderId.slice(0, 8)}
**Ombor:** ${order.restaurantName}
**Mijoz:** ${order.customerName}
**Manzil:** ${order.address}

**Buyurtma tarkibi:**
${order.items.map(item => `• ${item.name} × ${item.quantity} - ${Number(item.price * item.quantity).toLocaleString('ru-RU')} so'm`).join('\n')}

**Jami:** ${Number(order.totalPrice).toLocaleString('ru-RU')} so'm

Veb-saytda ko'rish: https://baraka.vercel.app/admin/orders`

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Tayyor',
                callback_data: `order_ready_${order.orderId}`
              }
            ]
          ]
        }
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      let errorMessage = responseData.description || 'Неизвестная ошибка'
      
      // Более понятные сообщения об ошибках
      if (responseData.error_code === 400) {
        if (errorMessage.includes('chat not found')) {
          errorMessage = 'Chat ID topilmadi. Botni /start buyrug\'i bilan ishga tushiring va Chat ID ni qayta tekshiring.'
        } else if (errorMessage.includes('chat_id is empty')) {
          errorMessage = 'Chat ID bo\'sh. To\'g\'ri Chat ID ni kiriting.'
        }
      } else if (responseData.error_code === 403) {
        errorMessage = 'Bot bloklangan. Foydalanuvchi botni bloklagan yoki botni ishga tushirish kerak.'
      } else if (responseData.error_code === 401) {
        errorMessage = 'Bot token noto\'g\'ri. TELEGRAM_BOT_TOKEN ni tekshiring.'
      }
      
      console.error('Ошибка отправки в Telegram:', {
        status: response.status,
        error: responseData,
        chatId,
        orderId: order.orderId,
      })
      return { success: false, error: errorMessage }
    }

    console.log('Уведомление успешно отправлено в Telegram:', {
      chatId,
      orderId: order.orderId,
      messageId: responseData.result?.message_id,
    })

    return { success: true }
  } catch (error: any) {
    const errorMessage = error.message || 'Ошибка сети при отправке в Telegram'
    console.error('Ошибка при отправке уведомления в Telegram:', {
      error: errorMessage,
      chatId,
      orderId: order.orderId,
    })
    return { success: false, error: errorMessage }
  }
}

