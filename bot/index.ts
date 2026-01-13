import TelegramBot from 'node-telegram-bot-api'

// Токен бота из переменных окружения или напрямую
const token = process.env.TELEGRAM_BOT_TOKEN || '8393509629:AAEIogSE6Z5ltFvWYt8TPDi0EtoNBMlWzio'

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true })

// Приветственное сообщение при команде /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'Foydalanuvchi'
  
  const welcomeMessage = `Assalomu alaykum, ${firstName}! 👋

Baraka - mahsulotlar yetkazib berish xizmati botiga xush kelibsiz! 🛒

Bu bot orqali siz:
• Mahsulotlar haqida ma'lumot olishingiz mumkin
• Buyurtma berishingiz mumkin
• Sotuvchi bo'lishingiz mumkin

Quyidagi tugmalardan birini tanlang:`

  // Создаем инлайн кнопки
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'ℹ️ Bot haqida', callback_data: 'bot_info' }
        ],
        [
          { text: '🏪 Sotuvchi bo\'lish', callback_data: 'become_seller' }
        ]
      ]
    }
  }

  bot.sendMessage(chatId, welcomeMessage, options)
})

// Обработка нажатий на инлайн кнопки
bot.on('callback_query', (query) => {
  const chatId = query.message?.chat.id
  const data = query.data

  if (!chatId) return

  if (data === 'bot_info') {
    const infoMessage = `📱 **Baraka Bot haqida**

Bu bot Baraka mahsulotlar yetkazib berish xizmati uchun yaratilgan.

**Xizmatlar:**
• Mahsulotlar katalogini ko'rish
• Buyurtma berish
• Buyurtma holatini kuzatish
• Sotuvchi bo'lish

**Veb-sayt:** [Baraka](https://baraka.vercel.app)

Savollaringiz bo'lsa, bizga yozing! 💬`

    bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' })
    
    // Отвечаем на callback query
    bot.answerCallbackQuery(query.id)
  } else if (data === 'become_seller') {
    const sellerMessage = `🏪 **Sotuvchi bo'lish**

Sotuvchi bo'lish uchun quyidagi qadamlarni bajaring:

1. Veb-saytimizga kiring: [Baraka](https://baraka.vercel.app)
2. Ro'yxatdan o'ting yoki tizimga kiring
3. Admin bilan bog'laning va sotuvchi bo'lish uchun ariza bering

**Afzalliklari:**
• O'z mahsulotlaringizni qo'shish
• Buyurtmalarni boshqarish
• Daromad olish

Qo'shimcha ma'lumot uchun admin bilan bog'laning! 📞`

    bot.sendMessage(chatId, sellerMessage, { parse_mode: 'Markdown' })
    
    // Отвечаем на callback query
    bot.answerCallbackQuery(query.id)
  }
})

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  
  const helpMessage = `🆘 **Yordam**

**Mavjud buyruqlar:**
/start - Botni ishga tushirish
/help - Yordam olish
/info - Bot haqida ma'lumot

**Tugmalar:**
• Bot haqida - Bot haqida batafsil ma'lumot
• Sotuvchi bo'lish - Sotuvchi bo'lish uchun ko'rsatmalar

Savollaringiz bo'lsa, bizga yozing! 💬`

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' })
})

// Обработка команды /info
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id
  
  const infoMessage = `📱 **Baraka Bot**

Baraka - mahsulotlar yetkazib berish xizmati.

**Veb-sayt:** [Baraka](https://baraka.vercel.app)

**Xizmatlar:**
• Mahsulotlar katalogi
• Buyurtma berish
• Buyurtma kuzatish
• Sotuvchi bo'lish

Biz bilan bog'lanish: @baraka_support`

  bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' })
})

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

// Обработка неизвестных сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id
  
  // Игнорируем команды
  if (msg.text?.startsWith('/')) {
    return
  }
  
  // Отвечаем на обычные сообщения
  const response = `Kechirasiz, men hali bunday buyruqni tushunmayman. 😅

Yordam olish uchun /help buyrug'ini yuboring yoki quyidagi tugmalardan foydalaning.`

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'ℹ️ Bot haqida', callback_data: 'bot_info' }
        ],
        [
          { text: '🏪 Sotuvchi bo\'lish', callback_data: 'become_seller' }
        ]
      ]
    }
  }

  bot.sendMessage(chatId, response, options)
})

console.log('🤖 Baraka Telegram bot ishga tushdi!')
console.log('Bot is running and waiting for messages...')

