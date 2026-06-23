import { useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../api'
import { useAsync } from '../lib/useAsync'
import { PILAR_INFO, pilar, status as statusInfo } from '../lib/pillars'
import { Badge, Button, Card, PageHeader, Spinner } from '../components/ui'
import PostEditor from '../components/PostEditor'
import type { Post } from '../types'

export default function Posts() {
  const { data, loading, setData } = useAsync<Post[]>(api.posts)
  const [selId, setSelId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('todos')

  const posts = data ?? []
  const filtrados = posts.filter((p) => filtro === 'todos' || p.pilar === filtro)
  const selecionado = posts.find((p) => p.id === selId) ?? filtrados[0] ?? posts[0] ?? null

  const pilaresPresentes = Array.from(new Set(posts.map((p) => p.pilar)))

  async function novoPost() {
    const novo = await api.createPost({ titulo: 'Novo post', corpo: '', pilar: 'tech' })
    setData([...(data ?? []), novo])
    setSelId(novo.id)
  }

  function aoSalvar(p: Post) {
    setData((data ?? []).map((x) => (x.id === p.id ? p : x)))
  }

  function aoExcluir(id: string) {
    const restantes = (data ?? []).filter((x) => x.id !== id)
    setData(restantes)
    setSelId(restantes[0]?.id ?? null)
  }

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
        title="Posts"
        subtitle={`${posts.length} no acervo · edite, pré-visualize e copie pronto pra colar`}
        action={
          <Button onClick={novoPost}>
            <Plus size={16} /> Novo post
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['todos', ...pilaresPresentes].map((id) => {
          const ativo = filtro === id
          const label = id === 'todos' ? 'Todos' : `${pilar(id).emoji} ${pilar(id).label}`
          return (
            <button
              key={id}
              onClick={() => setFiltro(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                ativo ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* lista */}
        <div className="w-full shrink-0 space-y-2 lg:w-80">
          {filtrados.map((p) => {
            const info = pilar(p.pilar)
            const st = statusInfo(p.status)
            const ativo = selecionado?.id === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelId(p.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  ativo
                    ? 'border-sky-500/50 bg-sky-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: info.cor }} />
                  <span className="truncate text-sm font-medium text-zinc-100">{p.titulo}</span>
                </div>
                <p className="line-clamp-2 text-xs text-zinc-500">{p.hook || p.corpo.slice(0, 90)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge color={info.cor}>{info.label}</Badge>
                  <Badge color={st.cor}>{st.label}</Badge>
                  {p.formato === 'carrossel' && <Badge>carrossel</Badge>}
                </div>
              </button>
            )
          })}
        </div>

        {/* editor */}
        <Card className="flex-1 p-6">
          {selecionado ? (
            <PostEditor key={selecionado.id} post={selecionado} onSaved={aoSalvar} onDeleted={aoExcluir} />
          ) : (
            <div className="py-20 text-center text-sm text-zinc-500">
              Nenhum post. Crie um com <strong className="text-zinc-300">Novo post</strong>.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
