import TelegramBot from 'node-telegram-bot-api'
import { createClient } from '@supabase/supabase-js'

// Токен бота из переменных окружения или напрямую
const token = process.env.TELEGRAM_BOT_TOKEN || '8393509629:AAEIogSE6Z5ltFvWYt8TPDi0EtoNBMlWzio'

// Настройка Supabase для бота
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Supabase client initialized for bot')
} else {
  console.warn('⚠️ Supabase credentials not found. Order status updates will use API endpoint.')
}

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true })

// Функция для получения настроек бота из базы данных
async function getBotSettings() {
  if (!supabase) {
    // Fallback настройки, если Supabase не настроен
    return {
      button_about_text: 'ℹ️ Bot haqida',
      button_seller_text: '🏪 Sotuvchi bo\'lish',
      welcome_message: 'Assalomu alaykum, {firstName}! 👋\n\nBazar + - mahsulotlar yetkazib berish xizmati botiga xush kelibsiz! 🛒\n\nBu bot orqali siz:\n• Mahsulotlar haqida ma\'lumot olishingiz mumkin\n• Buyurtma berishingiz mumkin\n• Sotuvchi bo\'lishingiz mumkin\n\nQuyidagi tugmalardan birini tanlang:',
      about_message: '📱 **Bazar + Bot haqida**\n\nBu bot Bazar + mahsulotlar yetkazib berish xizmati uchun yaratilgan.\n\n**Xizmatlar:**\n• Mahsulotlar katalogini ko\'rish\n• Buyurtma berish\n• Buyurtma holatini kuzatish\n• Sotuvchi bo\'lish\n\n**Veb-sayt:** [Bazar +](https://baraka.vercel.app)\n\nSavollaringiz bo\'lsa, bizga yozing! 💬',
      seller_message: '🏪 **Sotuvchi bo\'lish**\n\nSotuvchi bo\'lish uchun quyidagi qadamlarni bajaring:\n\n1. Veb-saytimizga kiring: [Bazar +](https://baraka.vercel.app)\n2. Ro\'yxatdan o\'ting yoki tizimga kiring\n3. Admin bilan bog\'laning va sotuvchi bo\'lish uchun ariza bering\n\n**Afzalliklari:**\n• O\'z mahsulotlaringizni qo\'shish\n• Buyurtmalarni boshqarish\n• Daromad olish\n\nQo\'shimcha ma\'lumot uchun admin bilan bog\'laning! 📞'
    }
  }

  try {
    const { data, error } = await supabase
      .from('bot_settings')
      .select('key, value')

    if (error || !data) {
      console.error('Error loading bot settings:', error)
      return null
    }

    const settings: Record<string, string> = {}
    data.forEach(item => {
      settings[item.key] = item.value
    })

    return settings
  } catch (error) {
    console.error('Error fetching bot settings:', error)
    return null
  }
}

// Приветственное сообщение при команде /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'Foydalanuvchi'
  
  const settings = await getBotSettings()
  
  const welcomeMessage = settings?.welcome_message 
    ? settings.welcome_message.replace('{firstName}', firstName)
    : `Assalomu alaykum, ${firstName}! 👋

Bazar + - mahsulotlar yetkazib berish xizmati botiga xush kelibsiz! 🛒

Bu bot orqali siz:
• Mahsulotlar haqida ma'lumot olishingiz mumkin
• Buyurtma berishingiz mumkin
• Sotuvchi bo'lishingiz mumkin

Quyidagi tugmalardan birini tanlang:`

  const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
  const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'

  // Создаем reply keyboard (постоянная клавиатура под полем ввода)
  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: buttonAboutText },
          { text: buttonSellerText }
        ]
      ],
      resize_keyboard: true, // Кнопки подстраиваются под размер экрана
      one_time_keyboard: false // Клавиатура остается видимой
    }
  }

  bot.sendMessage(chatId, welcomeMessage, options)
})

// Обработка нажатий на кнопки reply keyboard
bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  // Игнорируем команды
  if (text?.startsWith('/')) {
    return
  }

  // Получаем настройки бота
  const settings = await getBotSettings()
  const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
  const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'

  // Обработка нажатий на кнопки
  if (text === buttonAboutText) {
    const infoMessage = settings?.about_message || `📱 **Bazar + Bot haqida**

Bu bot Bazar + mahsulotlar yetkazib berish xizmati uchun yaratilgan.

**Xizmatlar:**
• Mahsulotlar katalogini ko'rish
• Buyurtma berish
• Buyurtma holatini kuzatish
• Sotuvchi bo'lish

**Veb-sayt:** [Bazar +](https://baraka.vercel.app)

Savollaringiz bo'lsa, bizga yozing! 💬`

    // Отправляем сообщение с той же клавиатурой
    const options = {
      reply_markup: {
        keyboard: [
          [
            { text: buttonAboutText },
            { text: buttonSellerText }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }

    bot.sendMessage(chatId, infoMessage, { 
      parse_mode: 'Markdown',
      reply_markup: options.reply_markup
    })
    return
  } else if (text === buttonSellerText) {
    const sellerMessage = settings?.seller_message || `🏪 **Sotuvchi bo'lish**

Sotuvchi bo'lish uchun quyidagi qadamlarni bajaring:

1. Veb-saytimizga kiring: [Bazar +](https://baraka.vercel.app)
2. Ro'yxatdan o'ting yoki tizimga kiring
3. Admin bilan bog'laning va sotuvchi bo'lish uchun ariza bering

**Afzalliklari:**
• O'z mahsulotlaringizni qo'shish
• Buyurtmalarni boshqarish
• Daromad olish

Qo'shimcha ma'lumot uchun admin bilan bog'laning! 📞`

    // Отправляем сообщение с той же клавиатурой
    const options = {
      reply_markup: {
        keyboard: [
          [
            { text: buttonAboutText },
            { text: buttonSellerText }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }

    bot.sendMessage(chatId, sellerMessage, { 
      parse_mode: 'Markdown',
      reply_markup: options.reply_markup
    })
    return
  }

  // Обработка неизвестных сообщений
  const response = `Kechirasiz, men hali bunday buyruqni tushunmayman. 😅

Yordam olish uchun /help buyrug'ini yuboring yoki quyidagi tugmalardan foydalaning.`

  // Получаем настройки для клавиатуры
  const settings = await getBotSettings()
  const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
  const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: buttonAboutText },
          { text: buttonSellerText }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  }

  bot.sendMessage(chatId, response, options)
})

// Обработка команды /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id
  
  const settings = await getBotSettings()
  const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
  const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'
  
  const helpMessage = `🆘 **Yordam**

**Mavjud buyruqlar:**
/start - Botni ishga tushirish
/help - Yordam olish
/info - Bot haqida ma'lumot

**Tugmalar:**
• ${buttonAboutText} - Bot haqida batafsil ma'lumot
• ${buttonSellerText} - Sotuvchi bo'lish uchun ko'rsatmalar

Savollaringiz bo'lsa, bizga yozing! 💬`

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: buttonAboutText },
          { text: buttonSellerText }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  }

  bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown',
    reply_markup: options.reply_markup
  })
})

// Обработка команды /info
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id
  
  const settings = await getBotSettings()
  const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
  const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'
  
  const infoMessage = settings?.about_message || `📱 **Bazar + Bot**

Bazar + - mahsulotlar yetkazib berish xizmati.

**Veb-sayt:** [Bazar +](https://baraka.vercel.app)

**Xizmatlar:**
• Mahsulotlar katalogi
• Buyurtma berish
• Buyurtma kuzatish
• Sotuvchi bo'lish

Biz bilan bog'lanish: @baraka_support`

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: buttonAboutText },
          { text: buttonSellerText }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  }

  bot.sendMessage(chatId, infoMessage, { 
    parse_mode: 'Markdown',
    reply_markup: options.reply_markup
  })
})

// Обработка нажатий на inline кнопки (callback_query)
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id
  const messageId = query.message?.message_id
  const data = query.data

  if (!chatId || !messageId || !data) {
    return
  }

  // Обработка кнопки "Готов" для заказа
  if (data.startsWith('order_ready_')) {
    const orderId = data.replace('order_ready_', '')
    
    try {
      // Отвечаем на callback сразу, чтобы убрать индикатор загрузки
      await bot.answerCallbackQuery(query.id, {
        text: 'Buyurtma holati yangilanmoqda...',
        show_alert: false
      })

      let updateSuccess = false

      // Пытаемся обновить через Supabase напрямую (если настроено)
      if (supabase) {
        try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              status: 'ready' as any,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', orderId)

          if (!updateError) {
            updateSuccess = true
          } else {
            console.error('Supabase update error:', updateError)
          }
        } catch (supabaseError) {
          console.error('Supabase direct update failed:', supabaseError)
        }
      }

      // Если прямой доступ к Supabase не сработал, используем API
      if (!updateSuccess) {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://baraka.vercel.app'
        const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'ready' }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Xatolik yuz berdi')
        }

        updateSuccess = true
      }

      if (!updateSuccess) {
        throw new Error('Buyurtma holatini yangilashda xatolik yuz berdi')
      }

      // Обновляем сообщение в боте
      const originalText = query.message?.text || ''
      const updatedText = originalText + '\n\n✅ **Holat:** Tayyor\n\nBuyurtma tayyor bo\'ldi!'

      await bot.editMessageText(updatedText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [] // Убираем кнопку после нажатия
        }
      })

      // Получаем настройки для клавиатуры
      const settings = await getBotSettings()
      const buttonAboutText = settings?.button_about_text || 'ℹ️ Bot haqida'
      const buttonSellerText = settings?.button_seller_text || '🏪 Sotuvchi bo\'lish'

      // Отправляем подтверждение
      await bot.sendMessage(chatId, '✅ Buyurtma holati "Tayyor" ga o\'zgartirildi!', {
        reply_markup: {
          keyboard: [
            [
              { text: buttonAboutText },
              { text: buttonSellerText }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      })
    } catch (error: any) {
      console.error('Error processing order ready callback:', error)
      
      // Уведомляем об ошибке
      await bot.answerCallbackQuery(query.id, {
        text: 'Xatolik: ' + (error.message || 'Noma\'lum xatolik'),
        show_alert: true
      })
    }
  }
})

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

console.log('🤖 Bazar + Telegram bot ishga tushdi!')
console.log('Bot is running and waiting for messages...')

