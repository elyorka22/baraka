export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'super_admin' | 'manager' | 'collector' | 'courier' | 'customer'

export type OrderStatus = 
  | 'pending' 
  | 'assigned_to_collector' 
  | 'collecting' 
  | 'ready' 
  | 'assigned_to_courier' 
  | 'delivering' 
  | 'delivered' 
  | 'cancelled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role: UserRole
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          image_url: string | null
          restaurant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          restaurant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          restaurant_id?: string
          created_at?: string
        }
      }
      dishes: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category_id: string
          restaurant_id: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id: string
          restaurant_id: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: string
          restaurant_id?: string
          is_available?: boolean
          created_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          position: number
          is_active: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          link_url?: string | null
          position: number
          is_active?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          link_url?: string | null
          position?: number
          is_active?: boolean
          created_by?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          status: OrderStatus
          total_price: number
          address: string
          phone: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          status?: OrderStatus
          total_price: number
          address: string
          phone: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          status?: OrderStatus
          total_price?: number
          address?: string
          phone?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          dish_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          dish_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          dish_id?: string
          quantity?: number
          price?: number
        }
      }
      order_assignments: {
        Row: {
          id: string
          order_id: string
          collector_id: string | null
          courier_id: string | null
          assigned_by: string
          assigned_at: string
          status: string
        }
        Insert: {
          id?: string
          order_id: string
          collector_id?: string | null
          courier_id?: string | null
          assigned_by: string
          assigned_at?: string
          status?: string
        }
        Update: {
          id?: string
          order_id?: string
          collector_id?: string | null
          courier_id?: string | null
          assigned_by?: string
          assigned_at?: string
          status?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}


