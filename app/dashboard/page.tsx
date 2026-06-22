import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Project } from '@/types'
import { Plus, Zap, Globe, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = (projects as Project[]) || []

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '2px' }}>Overview</h1>
          <p style={{ fontSize: '12px', color: 'var(--text2)' }}>Your PWA projects</p>
        </div>
        <Link href="/dashboard/projects/new" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 14px', borderRadius: '7px',
          background: '#fff', color: '#000', textDecoration: 'none',
          fontWeight: 500, fontSize: '13px',
        }}>
          <Plus size={14}/> New Site
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total projects', value: list.length },
          { label: 'Active', value: list.filter(p => p.status === 'active').length },
          { label: 'Total installs', value: '—' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg2)',
            borderRadius: '10px', padding: '14px 16px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      {list.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg2)',
          borderRadius: '12px', border: '1px dashed var(--border2)',
        }}>
          <Zap size={28} color="var(--text3)" style={{ margin: '0 auto 12px' }}/>
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>No projects yet</p>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px' }}>
            Paste a Framer URL to create your first PWA.
          </p>
          <Link href="/dashboard/projects/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '7px',
            background: '#fff', color: '#000', textDecoration: 'none',
            fontWeight: 500, fontSize: '13px',
          }}>
            <Plus size={14}/> Create project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' }}>
          {list.map(p => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg2)',
                borderRadius: '10px', padding: '16px',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '9px',
                    background: p.theme_color || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={16} color="#fff"/>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{p.short_name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                      background: p.status === 'active' ? 'rgba(34,197,94,0.1)' : 'var(--bg3)',
                      color: p.status === 'active' ? 'var(--green)' : 'var(--text3)',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }}/>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={11}/> {p.foldaa_subdomain}.foldaa.com
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <Clock size={11}/> {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}