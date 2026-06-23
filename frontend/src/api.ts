import type { Briefing, Pillar, Post, Stats, UploadItem } from './types'

async function j<T>(url: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(url, opts)
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json() as Promise<T>
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export const api = {
  stats: () => j<Stats>('/api/stats'),
  posts: () => j<Post[]>('/api/posts'),
  pillars: () => j<Pillar[]>('/api/pillars'),
  trendsLatest: () => j<Briefing>('/api/trends/latest'),
  updatePost: (id: string, data: Partial<Post>) =>
    j<Post>(`/api/posts/${id}`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(data) }),
  createPost: (data: Partial<Post>) =>
    j<Post>('/api/posts', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(data) }),
  deletePost: (id: string) => j<unknown>(`/api/posts/${id}`, { method: 'DELETE' }),
  runRadar: () => j<Briefing>('/api/radar/run', { method: 'POST' }),
  uploads: () => j<UploadItem[]>('/api/uploads'),
  upload: (file: File) => {
    const fd = new FormData()
    fd.append('arquivo', file)
    return j<UploadItem>('/api/uploads', { method: 'POST', body: fd })
  },
}
