'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types'
import {
  RefreshCw, ExternalLink, Download, Copy, Check,
  Globe, Smartphone, Monitor, Cpu, BarChart2, Lock,
  Settings, Trash2, ChevronRight, Apple, Zap, Shield
} from 'lucide-react'

interface Props { project: Project }

type Tab = 'overview' | 'analytics' | 'auth' | 'domains' | 'settings'

export default function ProjectDashboard({ project: initialProject }: Props) {
  const [project, setProject] = useState(initialProject)
  const [tab, setTab] = useState<Tab>('overview')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [manifestJson, setManifestJson] = useState('')
  const [swCode, setSwCode] = useState('')
  const [showManifest, setShowManifest] = useState(false)
  const [showSW, setShowSW] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const pwaUrl = project.custom_domain
    ? `https://${project.custom_domain}`
    : `https://${project.foldaa_subdomain}.foldaa.com`

  useEffect(() => { drawQR() }, [pwaUrl])

  function drawQR() {
    const canvas = qrRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = 100; const cell = size / 9
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size)
    const corners = [[0,0],[0,6],[6,0]]
    corners.forEach(([cr, cc]) => {
      ctx.fillStyle = '#111'
      ctx.fillRect(cc*cell, cr*cell, cell*3, cell*3)
      ctx.fillStyle = '#fff'
      ctx.fillRect(cc*cell+cell*0.5, cr*cell+cell*0.5, cell*2, cell*2)
      ctx.fillStyle = '#111'
      ctx.fillRect(cc*cell+cell, cr*cell+cell, cell, cell)
    })
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const inCorner = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)
      if (!inCorner && Math.random() > 0.5) {
        ctx.fillStyle = '#111'
        ctx.fillRect(c*cell+0.5, r*cell+0.5, cell-1, cell-1)
      }
    }
  }

  async function save(updates: Partial<Project>) {
    setSaving(true)
    const updated = { ...project, ...updates }
    setProject(updated)
    await supabase.from('projects').update(updates).eq('id', project.id)
    setSaving(false)
  }

  async function generateManifest() {
    const res = await fetch(`/api/manifest?project_id=${project.id}`)
    const json = await res.json()
    setManifestJson(JSON.stringify(json, null, 2))
    setShowManifest(true)
  }

  async function generateSW() {
    const res = await fetch('/api/generate-sw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, offlineSupport: project.offline_support }),
    })
    const { sw } = await res.json()
    setSwCode(sw)
    setShowSW(true)
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(pwaUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function deleteProject() {
    if (!confirm('Delete this project permanently?')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/dashboard')
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div onClick={() => onChange(!value)} style={{
      width: '32px', height: '18px', borderRadius: '9px', cursor: 'pointer',
      background: value ? '#6366f1' : 'var(--bg4)',
      border: '0.5px solid var(--border2)', position: 'relative', flexShrink: 0,
      transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', width: '12px', height: '12px', background: '#fff',
        borderRadius: '50%', top: '2px', left: value ? '16px' : '2px',
        transition: 'left 0.2s',
      }}/>
    </div>
  )

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Zap size={12}/> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={12}/> },
    { key: 'auth', label: 'Auth', icon: <Lock size={12}/> },
    { key: 'domains', label: 'Domains', icon: <Globe size={12}/> },
    { key: 'settings', label: 'Settings', icon: <Settings size={12}/> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 20px', borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg2)', flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>~</span>
        <ChevronRight size={11} color="var(--text3)"/>
        <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{project.name}</span>
        <ChevronRight size={11} color="var(--text3)"/>
        <span style={{ fontSize: '12px', color: 'var(--text)' }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>

        <div style={{ display: 'flex', gap: '2px', marginLeft: '14px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '5px', border: 'none',
              background: tab === t.key ? 'var(--bg3)' : 'transparent',
              color: tab === t.key ? 'var(--text)' : 'var(--text2)',
              fontSize: '12px', cursor: 'pointer',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saving && <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Saving…</span>}
          <button onClick={() => window.open(pwaUrl, '_blank')} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
            borderRadius: '6px', border: '0.5px solid var(--border2)', background: 'transparent',
            color: 'var(--text)', fontSize: '12px', cursor: 'pointer',
          }}>
            <ExternalLink size={12}/> Open live
          </button>
          <button style={{
            padding: '5px 12px', borderRadius: '6px', border: 'none',
            background: '#fff', color: '#000', fontWeight: 500, fontSize: '12px', cursor: 'pointer',
          }}>
            Publish
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'overview' && <OverviewTab project={project} pwaUrl={pwaUrl} save={save} qrRef={qrRef} copyUrl={copyUrl} copied={copied} generateManifest={generateManifest} generateSW={generateSW} showManifest={showManifest} setShowManifest={setShowManifest} manifestJson={manifestJson} showSW={showSW} setShowSW={setShowSW} swCode={swCode} Toggle={Toggle}/>}
        {tab === 'analytics' && <AnalyticsTab project={project}/>}
        {tab === 'auth' && <AuthTab project={project} save={save} Toggle={Toggle}/>}
        {tab === 'domains' && <DomainsTab project={project} pwaUrl={pwaUrl} save={save}/>}
        {tab === 'settings' && <SettingsTab project={project} save={save} deleteProject={deleteProject} Toggle={Toggle}/>}
      </div>
    </div>
  )
}

function OverviewTab({ project, pwaUrl, save, qrRef, copyUrl, copied, generateManifest, generateSW, showManifest, setShowManifest, manifestJson, showSW, setShowSW, swCode, Toggle }: any) {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 500 }}>PWA Experience Dashboard</h2>

        {/* PWA Settings */}
        <Card title="PWA Settings" icon={<Smartphone size={13}/>}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Row label="App name"><input defaultValue={project.name} onBlur={e => save({ name: e.target.value })}/></Row>
              <Row label="Short name"><input defaultValue={project.short_name} onBlur={e => save({ short_name: e.target.value })}/></Row>
              <Row label="Start URL"><input defaultValue={project.start_url} onBlur={e => save({ start_url: e.target.value })}/></Row>
              <Row label="Display mode">
                <select defaultValue={project.display_mode} onChange={e => save({ display_mode: e.target.value })}>
                  {['standalone','fullscreen','minimal-ui','browser'].map(m => <option key={m}>{m}</option>)}
                </select>
              </Row>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Row label="Theme color">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" defaultValue={project.theme_color} onChange={e => save({ theme_color: e.target.value })} style={{ width: '32px', height: '28px', padding: '2px', cursor: 'pointer', flexShrink: 0 }}/>
                    <input defaultValue={project.theme_color} onBlur={e => save({ theme_color: e.target.value })}/>
                  </div>
                </Row>
                <Row label="Background">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" defaultValue={project.background_color} onChange={e => save({ background_color: e.target.value })} style={{ width: '32px', height: '28px', padding: '2px', cursor: 'pointer', flexShrink: 0 }}/>
                    <input defaultValue={project.background_color} onBlur={e => save({ background_color: e.target.value })}/>
                  </div>
                </Row>
              </div>
              <ToggleRow label="Offline support" value={project.offline_support} onChange={(v: boolean) => save({ offline_support: v })} Toggle={Toggle}/>
              <ToggleRow label="Install prompt" value={project.install_prompt} onChange={(v: boolean) => save({ install_prompt: v })} Toggle={Toggle}/>
              <ToggleRow label="Splash screen" value={project.splash_screen} onChange={(v: boolean) => save({ splash_screen: v })} Toggle={Toggle}/>
            </div>

            {/* Phone preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 500 }}>Preview</span>
              <div style={{
                width: '100px', height: '180px', borderRadius: '18px',
                border: '2px solid var(--border2)', background: 'var(--bg3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ width: '32px', height: '5px', background: 'var(--border2)', borderRadius: '3px', position: 'absolute', top: '8px' }}/>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: project.theme_color || '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={18} color="#fff"/>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '7px' }}>{project.short_name}</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center' }}>{project.foldaa_subdomain}.foldaa.com</div>
            </div>
          </div>

          {/* Generate buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid var(--border)' }}>
            <Btn onClick={generateManifest} icon={<Download size={12}/>}>Generate manifest.json</Btn>
            <Btn onClick={generateSW} icon={<Cpu size={12}/>}>Generate service worker</Btn>
          </div>

          {showManifest && (
            <CodeBlock title="manifest.json" code={manifestJson} onClose={() => setShowManifest(false)}/>
          )}
          {showSW && (
            <CodeBlock title="sw.js" code={swCode} onClose={() => setShowSW(false)}/>
          )}
        </Card>

        {/* Web Experience */}
        <Card title="Web Experience" icon={<Globe size={13}/>}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg3)', borderRadius: '7px', padding: '8px 12px',
          }}>
            <Globe size={13} color="var(--text3)"/>
            <span style={{ flex: 1, fontSize: '12px', fontFamily: 'var(--font-geist-mono, monospace)' }}>{project.foldaa_subdomain}.foldaa.com</span>
            <StatusBadge status={project.status}/>
            <Btn onClick={copyUrl} icon={copied ? <Check size={12}/> : <Copy size={12}/>}>
              {copied ? 'Copied' : 'Copy'}
            </Btn>
            <Btn onClick={() => window.open(pwaUrl, '_blank')} icon={<ExternalLink size={12}/>}>Open</Btn>
          </div>
        </Card>

        {/* Native platforms */}
        <Card title="Native Platforms" icon={<Monitor size={13}/>} subtitle="Desktop & Mobile">
          {[
            { icon: <Apple size={15}/>, name: 'macOS Application', desc: 'Build a native installer (DMG)', color: '#1d1d1d', actions: [<Btn key="d" icon={<Download size={11}/>}>Download</Btn>] },
            { icon: <Apple size={15}/>, name: 'iOS Application', desc: 'Install banner for iPhone & iPad', color: '#0a84ff22', actions: [<Btn key="c">Configure</Btn>] },
            { icon: <Zap size={15}/>, name: 'Android Application', desc: 'PWA with install prompt', color: '#22c55e22', actions: [<Btn key="c">Configure</Btn>] },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{p.desc}</div>
              </div>
              {p.actions}
            </div>
          ))}
        </Card>
      </div>

      {/* Right sidebar */}
      <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* QR */}
        <Card title="Scan to test" icon={<Smartphone size={13}/>}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center' }}>View your PWA on your device.</p>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '8px' }}>
              <canvas ref={qrRef} width="100" height="100"/>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{project.foldaa_subdomain}.foldaa.com</div>
            <Btn onClick={copyUrl} icon={copied ? <Check size={11}/> : <Copy size={11}/>} full>
              {copied ? 'Copied!' : 'Copy link'}
            </Btn>
          </div>
        </Card>

        {/* Quick stats */}
        <Card title="Quick Insights" icon={<BarChart2 size={13}/>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Installs', value: '—', sub: 'This week' },
              { label: 'Users', value: '—', sub: 'Active' },
              { label: 'Load', value: '—', sub: 'Avg time' },
              { label: 'Score', value: '—', sub: 'PWA score' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: '7px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 500 }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '1px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Framer */}
        <Card title="Framer connection" icon={<Zap size={13}/>}>
          <Row label="Site URL">
            <input defaultValue={project.framer_url} onBlur={e => save({ framer_url: e.target.value })} placeholder="https://yoursite.framer.website"/>
          </Row>
          <ToggleRow label="Auto-deploy" value={project.auto_deploy} onChange={(v: boolean) => save({ auto_deploy: v })} Toggle={Toggle}/>
          <Btn full icon={<RefreshCw size={11}/>} style={{ marginTop: '8px' }}>Sync now</Btn>
        </Card>
      </div>
    </div>
  )
}

function AnalyticsTab({ project }: { project: Project }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        {['Total installs', 'Avg. session', 'D7 retention'].map(l => (
          <div key={l} style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>{l}</div>
            <div style={{ fontSize: '26px', fontWeight: 500, color: 'var(--text2)' }}>—</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>No data yet</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
        <BarChart2 size={24} style={{ margin: '0 auto 10px', color: 'var(--text3)' }}/>
        Analytics will appear here once users start installing and using your PWA.
      </div>
    </div>
  )
}

function AuthTab({ project, save, Toggle }: any) {
  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Auth settings</h2>
      <Card title="Access control" icon={<Shield size={13}/>}>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '14px' }}>Control who can access your PWA.</p>
        {[
          { field: 'password_protection', label: 'Password protection', desc: 'Require a password to open the app' },
          { field: 'email_whitelist', label: 'Email whitelist', desc: 'Only allow specific email domains' },
          { field: 'login_to_install', label: 'Login to install', desc: 'Users must log in before installing' },
        ].map(({ field, label, desc }) => (
          <ToggleRow key={field} label={label} desc={desc} value={false} onChange={() => {}} Toggle={Toggle}/>
        ))}
      </Card>
    </div>
  )
}

function DomainsTab({ project, pwaUrl, save }: any) {
  const [domain, setDomain] = useState(project.custom_domain || '')
  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Domains</h2>
      <Card title="Custom domain" icon={<Globe size={13}/>}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourdomain.com"/>
          <button onClick={() => save({ custom_domain: domain })} style={{
            padding: '6px 14px', borderRadius: '6px', border: 'none',
            background: '#fff', color: '#000', fontWeight: 500, fontSize: '12px', cursor: 'pointer', flexShrink: 0,
          }}>Connect</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg3)', borderRadius: '7px', padding: '8px 12px' }}>
          <Globe size={13} color="var(--text3)"/>
          <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }}>{project.foldaa_subdomain}.foldaa.com</span>
          <StatusBadge status={project.status}/>
        </div>
      </Card>
      <Card title="SSL Certificate" icon={<Shield size={13}/>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="var(--green)"/>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>Certificate active</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Managed automatically via Let's Encrypt</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SettingsTab({ project, save, deleteProject, Toggle }: any) {
  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Settings</h2>
      <Card title="Project settings" icon={<Settings size={13}/>}>
        <Row label="Project name"><input defaultValue={project.name} onBlur={e => save({ name: e.target.value })}/></Row>
        <Row label="Framer URL"><input defaultValue={project.framer_url} onBlur={e => save({ framer_url: e.target.value })}/></Row>
        <ToggleRow label="Auto-deploy on publish" value={project.auto_deploy} onChange={(v: boolean) => save({ auto_deploy: v })} Toggle={Toggle}/>
      </Card>
      <Card title="Danger zone" icon={<Trash2 size={13}/>} danger>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '12px' }}>
          Deleting this project is permanent and cannot be undone.
        </p>
        <button onClick={deleteProject} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '6px',
          border: '0.5px solid rgba(239,68,68,0.4)',
          background: 'transparent', color: 'var(--red)', fontSize: '12px', cursor: 'pointer',
        }}>
          <Trash2 size={12}/> Delete project
        </button>
      </Card>
    </div>
  )
}

// --- Shared small components ---

function Card({ title, icon, subtitle, danger, children }: any) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: `0.5px solid ${danger ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
      borderRadius: '10px', padding: '16px', marginBottom: '0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: danger ? 'var(--red)' : 'var(--text2)', marginBottom: '14px' }}>
        {icon} {title}
        {subtitle && <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: '4px' }}>{subtitle}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: any) {
  return (
    <div>
      <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  )
}

function ToggleRow({ label, desc, value, onChange, Toggle }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text)' }}>{label}</div>
        {desc && <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{desc}</div>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  )
}

function Btn({ onClick, icon, children, full, style: extraStyle }: any) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
      padding: '5px 10px', borderRadius: '6px',
      border: '0.5px solid var(--border2)', background: 'transparent',
      color: 'var(--text)', fontSize: '11px', cursor: 'pointer',
      width: full ? '100%' : undefined,
      ...extraStyle,
    }}>
      {icon}{children}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
      background: active ? 'rgba(34,197,94,0.1)' : 'var(--bg3)',
      color: active ? 'var(--green)' : 'var(--text3)',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }}/>
      {status}
    </span>
  )
}

function CodeBlock({ title, code, onClose }: { title: string; code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ marginTop: '12px', background: 'var(--bg)', borderRadius: '8px', border: '0.5px solid var(--border2)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '0.5px solid var(--border)' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'monospace' }}>{title}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={copy} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {copied ? <Check size={11}/> : <Copy size={11}/>} {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
        </div>
      </div>
      <pre style={{ padding: '12px', fontSize: '11px', overflow: 'auto', maxHeight: '260px', margin: 0, fontFamily: 'var(--font-geist-mono, monospace)', lineHeight: 1.6 }}>
        {code}
      </pre>
    </div>
  )
}
