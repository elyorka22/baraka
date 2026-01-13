'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/utils/storage'

interface ImageUploadProps {
  bucket: string
  currentImageUrl?: string | null
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  label?: string
}

export function ImageUpload({
  bucket,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  label = 'Загрузить изображение'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('Размер файла не должен превышать 5MB')
      return
    }

    // Превью
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Загрузка
    setUploading(true)
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const path = `${fileName}`

    try {
      const url = await uploadImage(bucket, file, path)
      if (url) {
        onUploadComplete(url)
      } else {
        onUploadError?.('Ошибка при загрузке изображения')
        setPreview(currentImageUrl || null)
      }
    } catch (error) {
      onUploadError?.('Ошибка при загрузке изображения')
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${bucket}`}
          />
          <label
            htmlFor={`image-upload-${bucket}`}
            className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              uploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {uploading ? 'Загрузка...' : preview ? 'Изменить' : 'Выбрать файл'}
          </label>
        </div>
      </div>
    </div>
  )
}



