'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/database.types'

interface User {
  id: string
  full_name: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

interface UsersListProps {
  users: User[]
}

export function UsersList({ users: initialUsers }: UsersListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setUpdating(null)
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ))
    }
    setUpdating(null)
  }

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      super_admin: 'Супер-админ',
      manager: 'Менеджер',
      collector: 'Сборщик',
      courier: 'Курьер',
      customer: 'Клиент',
    }
    return labels[role]
  }

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      super_admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      collector: 'bg-green-100 text-green-800',
      courier: 'bg-yellow-100 text-yellow-800',
      customer: 'bg-gray-100 text-gray-800',
    }
    return colors[role]
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Пользователь
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name || 'Не указано'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.phone || 'Телефон не указан'}
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {user.id.slice(0, 8)}...
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  disabled={updating === user.id || user.role === 'super_admin'}
                  className={`px-3 py-1 rounded text-sm font-medium ${getRoleColor(user.role)} ${
                    updating === user.id || user.role === 'super_admin'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <option value="super_admin">Супер-админ</option>
                  <option value="manager">Менеджер</option>
                  <option value="collector">Сборщик</option>
                  <option value="courier">Курьер</option>
                  <option value="customer">Клиент</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleToggleActive(user.id, user.is_active)}
                  disabled={updating === user.id}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    user.is_active
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white disabled:opacity-50`}
                >
                  {updating === user.id ? '...' : user.is_active ? 'Деактивировать' : 'Активировать'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Пользователей пока нет</p>
        </div>
      )}
    </div>
  )
}



