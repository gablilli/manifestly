'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Globe, Palette, Settings } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    short_name: '',
    framer_url: '',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display_mode: 'standalone',
    start_url: '/',
    offline_support: true,
    install_prompt: true,
    auto_deploy: true,
  })

  function update(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'name' && !form.short_name) {
      setForm(f => ({ ...f, name: value as string, short_name: (value as string).slice(0, 12) }))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const subdomain = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)

    const { data, error } = await supabase.from('projects').insert({
      ...form,
      user_id: user.id,
      foldaa_subdomain: `${subdomain}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'active',
    }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/dashboard/projects/${data.id}`)
  }

  const Toggle = ({ field }: { field: keyof typeof form }) => (
    <div
      onClick={() => update(field, !form[field])}
      style={{
        width: '32px', height: '18px', borderRadius: '9px', cursor: 'pointer',
        background: form[field] ? '#6366f1' : 'var(--bg4)',
        border: '0.5px solid var(--border2)', position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', width: '12px', height: '12px', background: '#fff',
        borderRadius: '50%', top: '2px',
        left: form[field] ? '16px' : '2px',
        transition: 'left 0.2s',
      }}/>
    </div>
  )

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px', maxWidth: '640px' }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', color: 'var(--text2)',
          fontSize: '12px', cursor: 'pointer', marginBottom: '20px', padding: 0,
        }}
      >
        <ArrowLeft size={13}/> Back
      </button>

      <h1 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>New project</h1>
      <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '24px' }}>
        Paste your Framer URL and configure your PWA.
      </p>

      <form onSubmit={handleCreate}>
        {/* Basic */}
        <Section icon={<Globe size={14}/>} title="Basic info">
          <Field label="App name">
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="My App" required/>
          </Field>
          <Field label="Short name (max 12 chars)">
            <input value={form.short_name} onChange={e => update('short_name', e.target.value)} placeholder="App" maxLength={12} required/>
          </Field>
          <Field label="Framer site URL">
            <input value={form.framer_url} onChange={e => update('framer_url', e.target.value)} placeholder="https://yoursite.framer.website" type="url" required/>
          </Field>
          <Field label="Start URL">
            <input value={form.start_url} onChange={e => update('start_url', e.target.value)} placeholder="/"/>
          </Field>
        </Section>

        {/* Appearance */}
        <Section icon={<Palette size={14}/>} title="Appearance">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Theme color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={form.theme_color} onChange={e => update('theme_color', e.target.value)}
                  style={{ width: '36px', height: '32px', padding: '2px', cursor: 'pointer' }}/>
                <input value={form.theme_color} onChange={e => update('theme_color', e.target.value)} style={{ flex: 1 }}/>
              </div>
            </Field>
            <Field label="Background color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={form.background_color} onChange={e => update('background_color', e.target.value)}
                  style={{ width: '36px', height: '32px', padding: '2px', cursor: 'pointer' }}/>
                <input value={form.background_color} onChange={e => update('background_color', e.target.value)} style={{ flex: 1 }}/>
              </div>
            </Field>
          </div>
          <Field label="Display mode">
            <select value={form.display_mode} onChange={e => update('display_mode', e.target.value)}>
              <option value="standalone">standalone</option>
              <option value="fullscreen">fullscreen</option>
              <option value="minimal-ui">minimal-ui</option>
              <option value="browser">browser</option>
            </select>
          </Field>
        </Section>

        {/* Features */}
        <Section icon={<Settings size={14}/>} title="Features">
          {[
            { field: 'offline_support', label: 'Offline support', desc: 'Cache assets so the app works without internet' },
            { field: 'install_prompt', label: 'Install prompt', desc: 'Show install banner to returning visitors' },
            { field: 'auto_deploy', label: 'Auto-deploy on Framer publish', desc: 'Redeploy automatically when you publish in Framer' },
          ].map(({ field, label, desc }) => (
            <div key={field} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '0.5px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{desc}</div>
              </div>
              <Toggle field={field as keyof typeof form}/>
            </div>
          ))}
        </Section>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)',
            borderRadius: '7px', padding: '10px 12px', fontSize: '12px',
            color: 'var(--red)', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            background: '#fff', color: '#000', border: 'none',
            fontWeight: 500, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Creating project...' : 'Create project →'}
        </button>
      </form>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '0.5px solid var(--border)',
      borderRadius: '10px', padding: '16px', marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '12px', fontWeight: 500, color: 'var(--text2)',
        marginBottom: '14px',
      }}>
        {icon} {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
