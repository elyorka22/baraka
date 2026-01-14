'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BotSettingsFormProps {
  initialSettings: Record<string, { id: string; value: string; description: string }>
}

export function BotSettingsForm({ initialSettings }: BotSettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Обновляем каждую настройку
      const updates = Object.entries(settings).map(([key, setting]) =>
        fetch('/api/bot-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value: setting.value,
          }),
        })
      )

      const results = await Promise.all(updates)
      const errors = results.filter(r => !r.ok)

      if (errors.length > 0) {
        throw new Error("Ba'zi sozlamalarni saqlashda xatolik yuz berdi")
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      
      // Обновляем страницу для получения актуальных данных
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const settingsList = [
    {
      key: 'button_about_text',
      label: 'Tugma matni: "Bot haqida"',
      placeholder: 'Masalan: ℹ️ Bot haqida'
    },
    {
      key: 'button_seller_text',
      label: 'Tugma matni: "Sotuvchi bo\'lish"',
      placeholder: 'Masalan: 🏪 Sotuvchi bo\'lish'
    },
    {
      key: 'welcome_message',
      label: 'Xush kelibsiz xabari',
      placeholder: 'Приветственное сообщение. {firstName} - имя пользователя',
      isTextarea: true
    },
    {
      key: 'about_message',
      label: 'Xabar: "Bot haqida"',
      placeholder: 'Сообщение при нажатии на кнопку "О боте"',
      isTextarea: true
    },
    {
      key: 'seller_message',
      label: 'Xabar: "Sotuvchi bo\'lish"',
      placeholder: 'Сообщение при нажатии на кнопку "Стать продавцом"',
      isTextarea: true
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Sozlamalar muvaffaqiyatli saqlandi!
        </div>
      )}

      <div className="space-y-6">
        {settingsList.map((setting) => {
          const currentSetting = settings[setting.key]
          if (!currentSetting) return null

          return (
            <div key={setting.key}>
              <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700 mb-2">
                {setting.label}
              </label>
              {setting.description && (
                <p className="text-xs text-gray-500 mb-2">{currentSetting.description}</p>
              )}
              {setting.isTextarea ? (
                <textarea
                  id={setting.key}
                  value={currentSetting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  placeholder={setting.placeholder}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-mono text-sm"
                />
              ) : (
                <input
                  id={setting.key}
                  type="text"
                  value={currentSetting.value}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  placeholder={setting.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  )
}

