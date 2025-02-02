import { supabase } from './supabase';

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return !!data;
  } catch {
    return false;
  }
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('super_admin')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.super_admin || false;
  } catch {
    return false;
  }
}

export async function getAdminPermissions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.permissions || null;
  } catch {
    return null;
  }
}