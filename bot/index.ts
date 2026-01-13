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

  // Создаем reply keyboard (постоянная клавиатура под полем ввода)
  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: 'ℹ️ Bot haqida' },
          { text: '🏪 Sotuvchi bo\'lish' }
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

  // Обработка нажатий на кнопки
  if (text === 'ℹ️ Bot haqida') {
    const infoMessage = `📱 **Baraka Bot haqida**

Bu bot Baraka mahsulotlar yetkazib berish xizmati uchun yaratilgan.

**Xizmatlar:**
• Mahsulotlar katalogini ko'rish
• Buyurtma berish
• Buyurtma holatini kuzatish
• Sotuvchi bo'lish

**Veb-sayt:** [Baraka](https://baraka.vercel.app)

Savollaringiz bo'lsa, bizga yozing! 💬`

    // Отправляем сообщение с той же клавиатурой
    const options = {
      reply_markup: {
        keyboard: [
          [
            { text: 'ℹ️ Bot haqida' },
            { text: '🏪 Sotuvchi bo\'lish' }
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
  } else if (text === '🏪 Sotuvchi bo\'lish') {
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

    // Отправляем сообщение с той же клавиатурой
    const options = {
      reply_markup: {
        keyboard: [
          [
            { text: 'ℹ️ Bot haqida' },
            { text: '🏪 Sotuvchi bo\'lish' }
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

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: 'ℹ️ Bot haqida' },
          { text: '🏪 Sotuvchi bo\'lish' }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  }

  bot.sendMessage(chatId, response, options)
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

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: 'ℹ️ Bot haqida' },
          { text: '🏪 Sotuvchi bo\'lish' }
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

  const options = {
    reply_markup: {
      keyboard: [
        [
          { text: 'ℹ️ Bot haqida' },
          { text: '🏪 Sotuvchi bo\'lish' }
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

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

console.log('🤖 Baraka Telegram bot ishga tushdi!')
console.log('Bot is running and waiting for messages...')

