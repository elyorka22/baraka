import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint для тестирования Chat ID перед сохранением
 */
export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()

    if (!chatId || chatId.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'Chat ID bo\'sh' 
      }, { status: 400 })
    }

    // Валидация: Chat ID должен быть числом
    const chatIdNum = Number(chatId.trim())
    if (isNaN(chatIdNum)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chat ID raqam bo\'lishi kerak' 
      }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'TELEGRAM_BOT_TOKEN sozlanmagan' 
      }, { status: 500 })
    }

    // Пытаемся отправить тестовое сообщение
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: '✅ Test xabari. Chat ID to\'g\'ri sozlandi!',
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        let errorMessage = responseData.description || 'Noma\'lum xatolik'
        
        if (responseData.error_code === 400) {
          if (errorMessage.includes('chat not found')) {
            errorMessage = 'Chat ID topilmadi. Botni /start buyrug\'i bilan ishga tushiring va Chat ID ni qayta tekshiring.'
          } else if (errorMessage.includes('chat_id is empty')) {
            errorMessage = 'Chat ID bo\'sh. To\'g\'ri Chat ID ni kiriting.'
          }
        } else if (responseData.error_code === 403) {
          errorMessage = 'Bot bloklangan. Foydalanuvchi botni bloklagan yoki botni ishga tushirish kerak (/start).'
        } else if (responseData.error_code === 401) {
          errorMessage = 'Bot token noto\'g\'ri. TELEGRAM_BOT_TOKEN ni tekshiring.'
        }

        return NextResponse.json({ 
          success: false, 
          error: errorMessage,
          details: responseData
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Chat ID to\'g\'ri sozlandi! Test xabari yuborildi.'
      })
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Tarmoq xatosi' 
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Ichki xatolik' 
    }, { status: 500 })
  }
}

