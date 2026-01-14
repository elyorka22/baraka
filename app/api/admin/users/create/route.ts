import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint для создания пользователя с ролью менеджера
 * Использует service role key для создания пользователя через Admin API
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем роль
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password, full_name, phone, role = 'manager' } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Валидация роли
    const validRoles = ['manager', 'collector', 'courier', 'customer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Allowed: manager, collector, courier, customer' }, { status: 400 })
    }

    // Используем service role key для создания пользователя через Admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Создаем пользователя через Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Автоматически подтверждаем email
      user_metadata: {
        full_name: full_name || '',
        phone: phone || '',
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating user:', authError)
      return NextResponse.json({ 
        error: authError?.message || 'Failed to create user' 
      }, { status: 500 })
    }

    // Создаем профиль с указанной ролью
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: full_name || null,
        phone: phone || null,
        role: role,
        is_active: true,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Пытаемся удалить созданного пользователя, если профиль не создался
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        error: profileError.message || 'Failed to create profile' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role,
        full_name: full_name || null,
        phone: phone || null,
      }
    })
  } catch (error: any) {
    console.error('Error in create user API:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

