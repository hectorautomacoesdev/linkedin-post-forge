import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarClock, CheckCircle2, FileText, Lightbulb, Radar } from 'lucide-react'
import type { ReactNode } from 'react'
import { api } from '../api'
import { useAsync } from '../lib/useAsync'
import { pilar } from '../lib/pillars'
import { Card, PageHeader, Spinner } from '../components/ui'
import type { Briefing, Stats } from '../types'

const tooltipStyle = {
  background: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
  fontSize: 13,
}

function proximaJanela(): string {
  const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  const hoje = new Date()
  for (let i = 0; i < 8; i++) {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() + i)
    const dow = d.getDay()
    if ([2, 3, 4].includes(dow)) {
      if (i === 0 && hoje.getHours() >= 12) continue
      const quando = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : nomes[dow]
      return `${quando}, 7–9h`
    }
  }
  return 'terça, 7–9h'
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-100">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </Card>
  )
}

const DICAS = [
  'O hook (2 primeiras linhas) decide ~80% do alcance.',
  'Carrossel/documento é o formato de maior engajamento.',
  'Link externo? Só no 1º comentário (no corpo derruba ~60%).',
  'Os primeiros 60–90 min decidem ~70% do alcance — responda comentários.',
  'Tech é protagonista; hobby é lente, nunca assunto solto.',
]

export default function Dashboard() {
  const { data: stats, loading } = useAsync<Stats>(api.stats)
  const { data: brief } = useAsync<Briefing>(api.trendsLatest)

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const pieData = Object.entries(stats.por_pilar).map(([k, v]) => ({
    name: pilar(k).label,
    value: v,
    cor: pilar(k).cor,
  }))

  const opPorPilar: Record<string, number> = {}
  for (const o of brief?.oportunidades ?? []) {
    opPorPilar[o.pilar] = (opPorPilar[o.pilar] ?? 0) + 1
  }
  const barData = Object.entries(opPorPilar).map(([k, v]) => ({
    name: pilar(k).label,
    value: v,
    cor: pilar(k).cor,
  }))

  const prontos = stats.por_status['pronto'] ?? 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua produção de conteúdo e do que está em alta."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FileText size={16} />} label="Posts no acervo" value={stats.total_posts} hint="rascunhos + prontos" />
        <StatCard icon={<CheckCircle2 size={16} />} label="Prontos pra postar" value={prontos} hint="status 'pronto'" />
        <StatCard
          icon={<Radar size={16} />}
          label="Oportunidades no radar"
          value={stats.total_oportunidades}
          hint={stats.briefing_em ? `briefing de ${stats.briefing_em}` : 'sem briefing'}
        />
        <StatCard icon={<CalendarClock size={16} />} label="Próxima janela ideal" value={<span className="text-2xl">{proximaJanela()}</span>} hint="ter–qui de manhã" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Posts por pilar</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.cor} stroke="#18181b" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.cor }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Oportunidades em alta por pilar</h2>
          {barData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-500">Rode o radar na aba Tendências.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Lightbulb size={16} className="text-amber-400" /> Lembretes do algoritmo (2026)
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DICAS.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              {d}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
