'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types'
import {
  LayoutGrid, FilePlus, Folder, BarChart2, Settings,
  LogOut, ChevronDown, Zap
} from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  userEmail: string
  activeProjectId?: string
}

export default function Sidebar({ projects, userEmail, activeProjectId }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userEmail?.slice(0, 2).toUpperCase() || 'U'

  return (
    <aside style={{
      width: '220px', minWidth: '220px',
      background: 'var(--bg2)',
      borderRight: '0.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '12px 0',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '4px 14px 14px',
        borderBottom: '0.5px solid var(--border)',
        marginBottom: '10px',
      }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '6px',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#fff" strokeWidth="1.2"/>
            <path d="M4 6h4M6 4v4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.3px' }}>Foldaa</span>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 8px', marginBottom: '8px' }}>
        <SidebarItem
          icon={<LayoutGrid size={14}/>}
          label="Overview"
          active={pathname === '/dashboard'}
          onClick={() => router.push('/dashboard')}
        />
        <SidebarItem
          icon={<FilePlus size={14}/>}
          label="New Site"
          onClick={() => router.push('/dashboard/projects/new')}
        />
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            fontSize: '10px', fontWeight: 500, color: 'var(--text3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '6px 8px 4px',
          }}>
            Projects
          </div>
          {projects.map(p => (
            <SidebarItem
              key={p.id}
              icon={<Zap size={14}/>}
              label={p.name}
              active={activeProjectId === p.id}
              badge={p.status === 'active' ? undefined : p.status}
              dot={p.status === 'active'}
              onClick={() => router.push(`/dashboard/projects/${p.id}`)}
            />
          ))}
        </div>
      )}

      {/* Bottom */}
      <div style={{
        marginTop: 'auto',
        padding: '10px 8px 0',
        borderTop: '0.5px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: '#6366f1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#fff',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>Pro plan</div>
          </div>
          <ChevronDown size={12} color="var(--text3)"/>
        </div>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '6px 8px', borderRadius: '6px',
            background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: '12px', cursor: 'pointer', marginTop: '2px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          <LogOut size={13}/> Sign out
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({
  icon, label, active, badge, dot, onClick
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: string
  dot?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
        color: active ? 'var(--text)' : 'var(--text2)',
        background: active ? 'var(--bg4)' : 'transparent',
        fontSize: '12.5px', transition: 'background 0.1s, color 0.1s',
        marginBottom: '1px',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' } }}
    >
      {icon}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }}/>}
      {badge && (
        <span style={{
          fontSize: '10px', background: 'var(--bg4)', color: 'var(--text3)',
          padding: '1px 6px', borderRadius: '10px',
        }}>
          {badge}
        </span>
      )}
    </div>
  )
}
