import { useState } from 'react'
import { ExternalLink, Radar, Sparkles } from 'lucide-react'
import { api } from '../api'
import { useAsync } from '../lib/useAsync'
import { pilar } from '../lib/pillars'
import { Badge, Button, Card, PageHeader, Spinner } from '../components/ui'
import type { Briefing, Opportunity } from '../types'

function OportunidadeRow({ op, onUsar }: { op: Opportunity; onUsar: (op: Opportunity) => void }) {
  const info = pilar(op.pilar)
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-stretch">
        <div className="w-1 shrink-0" style={{ background: info.cor }} />
        <div className="flex-1 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Badge color={info.cor}>
              {info.emoji} {info.label}
            </Badge>
            <span className="text-xs text-zinc-500">{op.fonte}</span>
            <span className="ml-auto text-xs font-semibold text-zinc-400">score {op.score.toFixed(2)}</span>
          </div>
          <p className="text-sm font-medium text-zinc-100">{op.titulo}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Ângulo: {op.angulo_sugerido} · Hook: {op.hook_sugerido}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="subtle" onClick={() => onUsar(op)} title="Cria um rascunho a partir desta ideia">
              <Sparkles size={14} /> Criar rascunho
            </Button>
            {op.url && (
              <a
                href={op.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <ExternalLink size={14} /> Fonte
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Trends() {
  const { data, loading, setData } = useAsync<Briefing>(api.trendsLatest)
  const [rodando, setRodando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function rodarRadar() {
    setRodando(true)
    setMsg(null)
    try {
      const novo = await api.runRadar()
      setData(novo)
      setMsg('Radar atualizado com sucesso.')
    } catch (e) {
      setMsg(`Falha ao rodar o radar: ${e}`)
    } finally {
      setRodando(false)
    }
  }

  async function usarComoRascunho(op: Opportunity) {
    try {
      await api.createPost({
        titulo: op.titulo.slice(0, 60),
        pilar: op.pilar,
        formato: 'texto',
        hook_type: op.hook_sugerido,
        hook: '',
        corpo: `Ideia (a partir do radar): ${op.angulo_sugerido}\nGancho: ${op.titulo}\nFonte: ${op.url}`,
        status: 'rascunho',
      })
      setMsg(`Rascunho criado a partir de "${op.titulo.slice(0, 40)}…". Veja na aba Posts.`)
    } catch (e) {
      setMsg(`Não consegui criar o rascunho: ${e}`)
    }
  }

  const ops = data?.oportunidades ?? []

  return (
    <div>
      <PageHeader
        title="Tendências"
        subtitle={
          data?.gerado_em
            ? `Briefing de ${data.gerado_em} · ${data.total_candidatos ?? '?'} candidatos coletados`
            : 'Briefing do radar de tendências'
        }
        action={
          <Button onClick={rodarRadar} disabled={rodando}>
            {rodando ? <Spinner /> : <Radar size={16} />}
            {rodando ? 'Rodando…' : 'Rodar radar'}
          </Button>
        }
      />

      {msg && (
        <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : ops.length === 0 ? (
        <Card className="p-10 text-center text-sm text-zinc-500">
          Nenhuma oportunidade ainda. Clique em <strong className="text-zinc-300">Rodar radar</strong> para gerar um
          briefing (leva alguns segundos).
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ops.map((op, i) => (
            <OportunidadeRow key={`${op.url}-${i}`} op={op} onUsar={usarComoRascunho} />
          ))}
        </div>
      )}
    </div>
  )
}
