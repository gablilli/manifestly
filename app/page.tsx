import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: '#6366f1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
          fontSize: '24px',
        }}>⚡</div>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '10px', color: 'var(--text)' }}>
          Manifestly
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '32px', lineHeight: 1.6 }}>
          Turn any Framer site into a PWA. Generate your manifest, service worker, and deploy in seconds.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link href="/login" style={{
            padding: '10px 24px', borderRadius: '8px',
            background: '#fff', color: '#000', textDecoration: 'none',
            fontWeight: 500, fontSize: '14px',
          }}>
            Get started
          </Link>
          <Link href="/login" style={{
            padding: '10px 24px', borderRadius: '8px',
            border: '0.5px solid var(--border2)', color: 'var(--text)',
            textDecoration: 'none', fontSize: '14px',
          }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}