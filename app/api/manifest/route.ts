import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  if (!projectId) return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const appUrl = request.headers.get('origin') || ''

  const manifest = {
    name: project.name,
    short_name: project.short_name,
    start_url: project.start_url || '/',
    display: project.display_mode || 'standalone',
    theme_color: project.theme_color || '#6366f1',
    background_color: project.background_color || '#ffffff',
    icons: project.icon_url
      ? [
          { src: project.icon_url, sizes: '192x192', type: 'image/png' },
          { src: project.icon_url, sizes: '512x512', type: 'image/png' },
        ]
      : [
          { src: `${appUrl}/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${appUrl}/icon-512.png`, sizes: '512x512', type: 'image/png' },
        ],
    scope: '/',
    lang: 'en',
    description: `${project.name} PWA`,
  }

  return NextResponse.json(manifest)
}