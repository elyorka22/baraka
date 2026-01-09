import { createSupabaseClient } from '@/lib/supabase/client'

export async function uploadImage(
  bucket: string,
  file: File,
  path: string
): Promise<string | null> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Error deleting image:', error)
    return false
  }

  return true
}

export function getImageUrl(bucket: string, path: string): string {
  const supabase = createSupabaseClient()
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

