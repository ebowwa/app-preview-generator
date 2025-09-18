'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getUserProfile, listUserProjects } from '@/lib/supabase-operations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User, LogOut, FolderOpen, Settings, Plus, Clock,
  Share2, Users, Activity, ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      const [profileData, projectsData] = await Promise.all([
        getUserProfile(user.id),
        listUserProjects(user.id, 5)
      ])

      setProfile(profileData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      {/* Projects Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Projects
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {projects.length > 0 ? (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                className="cursor-pointer"
                onClick={() => {
                  window.location.href = `?project=${project.share_id}`
                }}
              >
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground">No projects yet</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = '/projects'}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            View All Projects
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || 'User'}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            )}
            <span className="text-sm font-medium">
              {profile?.username || user.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="text-sm font-medium">{profile?.full_name || profile?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Activity className="h-4 w-4 mr-2" />
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.location.href = '/shared'}
          >
            <Users className="h-4 w-4 mr-2" />
            Shared with Me
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function ProjectStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<{
    totalProjects: number
    recentActivity: any[]
    sharedProjects: number
  }>({
    totalProjects: 0,
    recentActivity: [],
    sharedProjects: 0
  })

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    try {
      const projects = await listUserProjects(user.id, 100)
      setStats({
        totalProjects: projects.length,
        recentActivity: projects.slice(0, 3),
        sharedProjects: 0 // Will be updated when we implement sharing
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (!user) return null

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Shared Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sharedProjects}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.recentActivity.length > 0
              ? new Date(stats.recentActivity[0].updated_at).toLocaleDateString()
              : 'No activity'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}