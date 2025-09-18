import { supabase, isSupabaseConfigured } from './supabase'
import type { Screen, DeviceType } from '@/types/preview-generator'

export interface ProjectData {
  id?: string
  name: string
  screens: Screen[]
  device_type: DeviceType
  created_at?: string
  updated_at?: string
  is_public?: boolean
  share_id?: string
  user_id?: string
  visibility?: 'private' | 'public' | 'unlisted'
  collaborators?: string[]
}

export interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  user_id: string
  default_device_type?: DeviceType
  theme?: 'light' | 'dark'
  auto_save?: boolean
  email_notifications?: boolean
}

// Create a new project
export async function createProject(data: {
  name: string
  screens: Screen[]
  deviceType: DeviceType
  userId?: string
  visibility?: 'private' | 'public' | 'unlisted'
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { data: { user } } = await supabase!.auth.getUser()

  const { data: project, error } = await supabase!
    .from('projects')
    .insert([
      {
        name: data.name,
        screens: data.screens,
        device_type: data.deviceType,
        user_id: data.userId || user?.id || null,
        visibility: data.visibility || (user ? 'private' : 'public')
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return project
}

// Get a project by share_id
export async function getProjectByShareId(shareId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { data: project, error } = await supabase!
    .from('projects')
    .select('*')
    .eq('share_id', shareId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    throw error
  }

  return project as ProjectData
}

// Update a project
export async function updateProject(shareId: string, data: {
  name?: string
  screens?: Screen[]
  deviceType?: DeviceType
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.screens) updateData.screens = data.screens
  if (data.deviceType) updateData.device_type = data.deviceType

  const { data: project, error } = await supabase!
    .from('projects')
    .update(updateData)
    .eq('share_id', shareId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return project
}

// Delete a project
export async function deleteProject(shareId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { error } = await supabase!
    .from('projects')
    .delete()
    .eq('share_id', shareId)

  if (error) {
    console.error('Error deleting project:', error)
    throw error
  }

  return true
}

// List user's projects
export async function listUserProjects(userId: string, limit: number = 50) {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data: projects, error } = await supabase!
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error listing user projects:', error)
    throw error
  }

  return projects
}

// List recent public projects
export async function listPublicProjects(limit: number = 10) {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data: projects, error } = await supabase!
    .from('projects')
    .select('id, name, share_id, created_at, updated_at, user_id')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error listing public projects:', error)
    throw error
  }

  return projects
}

// Save project to localStorage and optionally to Supabase
export function saveProjectLocally(shareId: string) {
  if (typeof window !== 'undefined') {
    const recentProjects = getLocalProjects()
    if (!recentProjects.includes(shareId)) {
      recentProjects.unshift(shareId)
      // Keep only last 10 projects
      if (recentProjects.length > 10) {
        recentProjects.pop()
      }
      localStorage.setItem('recentProjects', JSON.stringify(recentProjects))
    }
  }
}

// Get locally saved project IDs
export function getLocalProjects(): string[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('recentProjects')
    return saved ? JSON.parse(saved) : []
  }
  return []
}

// User profile operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null

  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase!
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data
}

// User preferences operations
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!isSupabaseConfigured()) return null

  const { data, error } = await supabase!
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching preferences:', error)
    return null
  }

  return data
}

export async function updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase!
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...updates
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating preferences:', error)
    throw error
  }

  return data
}

// Project sharing operations
export async function shareProject(projectId: string, email: string, permission: 'view' | 'edit' | 'admin' = 'view') {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  // First get the user by email
  const { data: userData, error: userError } = await supabase!
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  const { data, error } = await supabase!
    .from('project_shares')
    .insert({
      project_id: projectId,
      shared_with_user_id: userData.id,
      permission
    })
    .select()
    .single()

  if (error) {
    console.error('Error sharing project:', error)
    throw error
  }

  return data
}

export async function getSharedProjects(userId: string) {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabase!
    .from('project_shares')
    .select(`
      *,
      projects (*)
    `)
    .eq('shared_with_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shared projects:', error)
    return []
  }

  return data
}

// Activity logging
export async function logActivity(action: string, projectId?: string, metadata?: any) {
  if (!isSupabaseConfigured()) return

  const { data: { user } } = await supabase!.auth.getUser()
  if (!user) return

  const { error } = await supabase!
    .from('activity_log')
    .insert({
      user_id: user.id,
      project_id: projectId,
      action,
      metadata
    })

  if (error) {
    console.error('Error logging activity:', error)
  }
}

export async function getUserActivity(userId: string, limit: number = 20) {
  if (!isSupabaseConfigured()) return []

  const { data, error } = await supabase!
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching activity:', error)
    return []
  }

  return data
}