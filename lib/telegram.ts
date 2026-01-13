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
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN не установлен')
    return
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
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Ошибка отправки в Telegram:', error)
    }
  } catch (error) {
    console.error('Ошибка при отправке уведомления в Telegram:', error)
  }
}

