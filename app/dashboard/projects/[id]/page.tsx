import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Project } from '@/types'
import ProjectDashboard from './ProjectDashboard'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  return <ProjectDashboard project={project as Project} />
}
