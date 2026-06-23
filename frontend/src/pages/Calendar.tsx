import { CalendarDays, Clock } from 'lucide-react'
import { api } from '../api'
import { useAsync } from '../lib/useAsync'
import { pilar } from '../lib/pillars'
import { Badge, Card, PageHeader, Spinner } from '../components/ui'
import type { Post } from '../types'

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function proximasJanelas(qtd: number): Date[] {
  const out: Date[] = []
  const hoje = new Date()
  for (let i = 0; out.length < qtd && i < 40; i++) {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() + i)
    if ([2, 3, 4].includes(d.getDay())) {
      if (i === 0 && hoje.getHours() >= 12) continue
      out.push(d)
    }
  }
  return out
}

function fmt(d: Date) {
  return `${SEMANA[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { data, loading } = useAsync<Post[]>(api.posts)
  const posts = data ?? []
  const prontos = posts.filter((p) => p.status === 'pronto')
  const rascunhos = posts.filter((p) => p.status === 'rascunho')
  const janelas = proximasJanelas(6)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Calendário editorial"
        subtitle="Cadência recomendada: 2–3 posts/semana, terça a quinta de manhã (7–9h)."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {janelas.map((d, i) => {
          const post = prontos[i]
          const info = post ? pilar(post.pilar) : null
          return (
            <Card key={d.toISOString()} className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <CalendarDays size={16} className="text-sky-400" />
                {fmt(d)}
                <span className="ml-auto flex items-center gap-1 text-xs text-zinc-500">
                  <Clock size={12} /> 7–9h
                </span>
              </div>
              {post && info ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: info.cor }} />
                    <span className="text-sm font-medium text-zinc-100">{post.titulo}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-zinc-500">{post.hook}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-800 p-3 text-center text-xs text-zinc-600">
                  Vaga livre — marque um post como “pronto” para preencher
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">
          Backlog de rascunhos ({rascunhos.length})
        </h2>
        {rascunhos.length === 0 ? (
          <p className="text-sm text-zinc-500">Sem rascunhos.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {rascunhos.map((p) => {
              const info = pilar(p.pilar)
              return (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: info.cor }} />
                  {p.titulo}
                </span>
              )
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-zinc-500">
          Dica: o agendamento aqui é uma sugestão visual. Marque posts como “pronto” no editor para
          encaixá-los automaticamente nas próximas janelas ideais.
        </p>
      </Card>
    </div>
  )
}
