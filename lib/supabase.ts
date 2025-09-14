import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Apiary {
  id: string;
  name: string;
  description?: string;
  location?: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface ApiaryMember {
  id: string;
  apiary_id: string;
  profile_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Hive {
  id: string;
  apiary_id: string;
  name: string;
  location?: string;
  frames: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  population: string;
  varroa: string;
  honey: string;
  has_queen: boolean;
  queen_marked: boolean;
  queen_color?: string;
  queen_wing_clipped: boolean;
  queen_added_date?: string;
  is_nucleus: boolean;
  is_wintered: boolean;
  notes?: string;
  last_inspection: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  hive_id: string;
  inspector_id: string;
  date: string;
  time?: string;
  weather?: string;
  temperature?: number;
  duration?: string;
  brood_frames?: number;
  total_frames?: number;
  queen_seen?: boolean;
  temperament?: string;
  varroa_count?: number;
  varroa_days?: number;
  varroa_per_day?: number;
  varroa_level?: string;
  observations?: string[];
  notes?: string;
  is_wintering: boolean;
  winter_feed?: number;
  is_varroa_treatment: boolean;
  treatment_type?: string;
  new_queen_added: boolean;
  new_queen_marked?: boolean;
  new_queen_color?: string;
  new_queen_wing_clipped?: boolean;
  rating: number;
  findings?: string[];
  ai_analysis?: any;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  apiary_id: string;
  hive_id?: string;
  creator_id: string;
  assigned_to?: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: 'låg' | 'medel' | 'hög';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  enable_reminder: boolean;
  notification_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SharingCode {
  id: string;
  code: string;
  resource_type: 'apiary' | 'hive';
  resource_id: string;
  created_by: string;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface SharedAccess {
  id: string;
  sharing_code_id: string;
  profile_id: string;
  resource_type: 'apiary' | 'hive';
  resource_id: string;
  access_level: 'member' | 'admin';
  joined_at: string;
}