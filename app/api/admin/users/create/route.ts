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

    const { email, password, full_name, phone, role = 'manager', restaurant_id } = await request.json()

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

    if (authError) {
      console.error('Error creating user:', {
        error: authError,
        message: authError.message,
        status: authError.status,
        email
      })
      return NextResponse.json({ 
        error: authError.message || 'Failed to create user',
        details: authError
      }, { status: 500 })
    }

    if (!authData?.user) {
      console.error('User creation returned no user data')
      return NextResponse.json({ 
        error: 'User creation failed: no user data returned'
      }, { status: 500 })
    }

    // Небольшая задержка, чтобы триггер успел создать профиль
    await new Promise(resolve => setTimeout(resolve, 100))

    // Обновляем профиль (триггер уже создал его с ролью 'customer')
    // Используем upsert для обработки случая, если триггер еще не сработал
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: full_name || null,
        phone: phone || null,
        role: role,
        is_active: true,
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error updating profile:', {
        error: profileError,
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        userId: authData.user.id
      })
      // Пытаемся удалить созданного пользователя, если профиль не обновился
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error deleting user after profile update failure:', deleteError)
      }
      return NextResponse.json({ 
        error: profileError.message || 'Failed to update profile',
        details: profileError
      }, { status: 500 })
    }

    // Если это менеджер и указан склад, прикрепляем менеджера к складу
    if (role === 'manager' && restaurant_id) {
      // Проверяем, что склад существует и не имеет менеджера
      const { data: existingRestaurant, error: checkError } = await supabaseAdmin
        .from('restaurants')
        .select('id, manager_id')
        .eq('id', restaurant_id)
        .single()

      if (checkError) {
        console.error('Error checking restaurant:', checkError)
        return NextResponse.json({ 
          success: true,
          warning: 'User created but failed to verify restaurant',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: role,
            full_name: full_name || null,
            phone: phone || null,
          }
        })
      }

      if (!existingRestaurant) {
        console.error('Restaurant not found:', restaurant_id)
        return NextResponse.json({ 
          success: true,
          warning: 'User created but restaurant not found',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: role,
            full_name: full_name || null,
            phone: phone || null,
          }
        })
      }

      if (existingRestaurant.manager_id) {
        console.warn('Restaurant already has a manager:', existingRestaurant.manager_id)
        // Можно обновить менеджера или вернуть предупреждение
      }

      const { error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .update({ manager_id: authData.user.id })
        .eq('id', restaurant_id)

      if (restaurantError) {
        console.error('Error assigning manager to restaurant:', {
          error: restaurantError,
          message: restaurantError.message,
          code: restaurantError.code,
          restaurantId: restaurant_id,
          userId: authData.user.id
        })
        // Не удаляем пользователя, так как профиль уже создан
        // Просто возвращаем предупреждение
        return NextResponse.json({ 
          success: true,
          warning: 'User created but failed to assign to restaurant: ' + restaurantError.message,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: role,
            full_name: full_name || null,
            phone: phone || null,
          }
        })
      }
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
    console.error('Error in create user API:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json({ 
      error: error?.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}

