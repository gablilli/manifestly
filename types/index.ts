export interface Project {
  id: string
  user_id: string
  name: string
  short_name: string
  framer_url: string
  custom_domain: string | null
  foldaa_subdomain: string
  theme_color: string
  background_color: string
  display_mode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  start_url: string
  offline_support: boolean
  install_prompt: boolean
  splash_screen: boolean
  auto_deploy: boolean
  icon_url: string | null
  password_protection: boolean
  email_whitelist: boolean
  login_to_install: boolean
  status: 'active' | 'inactive' | 'building'
  created_at: string
  updated_at: string
}

export interface DeployLog {
  id: string
  project_id: string
  status: 'success' | 'failed' | 'building'
  message: string
  created_at: string
}

export interface Analytics {
  project_id: string
  date: string
  installs: number
  active_users: number
  sessions: number
}