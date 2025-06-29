import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface UserProfile {
  id: string;
  username: string;
  access_level: 'guest' | 'executor' | 'root';
  mystical_essence: number;
  current_title: string;
  titles: string[];
  created_at: string;
  updated_at: string;
}

export interface SoulEntity {
  id: string;
  name: string;
  original_form: string;
  current_form: string;
  status: 'active' | 'dormant' | 'transformed' | 'archived';
  chamber: string;
  energy_signature: number;
  stability: number;
  notes: string;
  access_level: 'public' | 'restricted' | 'classified';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TransformationRecord {
  id: string;
  soul_id: string;
  from_form: string;
  to_form: string;
  chamber: string;
  operator: string;
  success: boolean;
  notes: string;
  created_at: string;
}

export interface CraftedSpell {
  id: string;
  name: string;
  description: string;
  runes: any[]; // JSON array of runes
  power: number;
  stability: number;
  created_by: string;
  created_at: string;
}

export interface Prophecy {
  id: string;
  title: string;
  content: string;
  type: 'warning' | 'opportunity' | 'transformation' | 'dimensional' | 'temporal';
  probability: number;
  timeframe: string;
  chamber?: string;
  entities: string[]; // JSON array
  status: 'active' | 'fulfilled' | 'averted' | 'expired';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SystemEvent {
  id: string;
  event_type: 'transformation' | 'spell_cast' | 'prophecy' | 'system' | 'error';
  title: string;
  description: string;
  chamber?: string;
  user_id: string;
  metadata: any; // JSON object
  created_at: string;
}

export interface EnergyAllocation {
  id: string;
  chamber: string;
  allocated: number;
  maximum: number;
  efficiency: number;
  updated_by: string;
  updated_at: string;
}

// Database service functions
export class DatabaseService {
  // User Profile Functions
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Soul Registry Functions
  static async getSouls() {
    const { data, error } = await supabase
      .from('souls')
      .select(`
        *,
        transformations:transformation_records(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createSoul(soul: Omit<SoulEntity, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('souls')
      .insert([soul])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateSoul(id: string, updates: Partial<SoulEntity>) {
    const { data, error } = await supabase
      .from('souls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteSoul(id: string) {
    const { error } = await supabase
      .from('souls')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Transformation Functions
  static async addTransformation(transformation: Omit<TransformationRecord, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transformation_records')
      .insert([transformation])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Spell Crafting Functions
  static async getSpells(userId: string) {
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createSpell(spell: Omit<CraftedSpell, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('spells')
      .insert([spell])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteSpell(id: string, userId: string) {
    const { error } = await supabase
      .from('spells')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);
    
    if (error) throw error;
  }

  // Prophecy Functions
  static async getProphecies() {
    const { data, error } = await supabase
      .from('prophecies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createProphecy(prophecy: Omit<Prophecy, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('prophecies')
      .insert([prophecy])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProphecy(id: string, updates: Partial<Prophecy>) {
    const { data, error } = await supabase
      .from('prophecies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // System Events
  static async logEvent(event: Omit<SystemEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('system_events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getRecentEvents(limit: number = 50) {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Energy Management
  static async getEnergyAllocations() {
    const { data, error } = await supabase
      .from('energy_allocations')
      .select('*')
      .order('chamber');
    
    if (error) throw error;
    return data;
  }

  static async updateEnergyAllocation(chamber: string, allocated: number, userId: string) {
    const { data, error } = await supabase
      .from('energy_allocations')
      .upsert({
        chamber,
        allocated,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Authentication helpers
  static async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          access_level: 'guest'
        }
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
}