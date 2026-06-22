import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const projectId = formData.get('projectId') as string

  if (!file || !projectId) return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `${user.id}/${projectId}/icon.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('icons')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('icons').getPublicUrl(path)

  await supabase.from('projects').update({ icon_url: publicUrl }).eq('id', projectId)

  return NextResponse.json({ url: publicUrl })
}