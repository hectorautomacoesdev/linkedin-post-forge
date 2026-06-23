import { useEffect, useState } from 'react'
import { Check, Copy, Link2, Save, Trash2 } from 'lucide-react'
import { api } from '../api'
import { PILAR_INFO, STATUS_INFO, pilar } from '../lib/pillars'
import { Badge, Button, Field, inputClass } from './ui'
import type { Post } from '../types'

const HOOK_LIMITE = 210
const CORPO_LIMITE = 3000

export default function PostEditor({
  post,
  onSaved,
  onDeleted,
}: {
  post: Post
  onSaved: (p: Post) => void
  onDeleted: (id: string) => void
}) {
  const [form, setForm] = useState<Post>(post)
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Recarrega o formulário ao selecionar outro post.
  useEffect(() => setForm(post), [post.id])

  function set<K extends keyof Post>(k: K, v: Post[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function salvar() {
    setSalvando(true)
    try {
      const atualizado = await api.updatePost(form.id, {
        titulo: form.titulo,
        pilar: form.pilar,
        formato: form.formato,
        status: form.status,
        hook_type: form.hook_type,
        corpo: form.corpo,
        hashtags: form.hashtags,
        link_primeiro_comentario: form.link_primeiro_comentario,
      })
      onSaved(atualizado)
    } finally {
      setSalvando(false)
    }
  }

  async function copiar() {
    const txt = `${form.corpo}\n\n${form.hashtags.join(' ')}`.trim()
    await navigator.clipboard.writeText(txt)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  async function excluir() {
    if (!window.confirm('Excluir este post?')) return
    await api.deletePost(form.id)
    onDeleted(form.id)
  }

  const primeiraLinha = form.corpo.split('\n')[0] ?? ''
  const hookLongo = primeiraLinha.length > HOOK_LIMITE
  const corpoLongo = form.corpo.length > CORPO_LIMITE
  const info = pilar(form.pilar)

  const visivel = form.corpo.slice(0, HOOK_LIMITE)
  const resto = form.corpo.slice(HOOK_LIMITE)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 text-lg font-semibold text-zinc-100 outline-none focus:border-zinc-700"
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
        />
        <Button variant="subtle" onClick={copiar} title="Copiar corpo + hashtags">
          {copiado ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          {copiado ? 'Copiado!' : 'Copiar'}
        </Button>
        <Button onClick={salvar} disabled={salvando}>
          <Save size={16} /> {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
        <Button variant="ghost" onClick={excluir} title="Excluir post" className="text-rose-400 hover:bg-rose-500/10">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* coluna de edição */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pilar">
              <select className={inputClass} value={form.pilar} onChange={(e) => set('pilar', e.target.value)}>
                {Object.entries(PILAR_INFO).map(([id, p]) => (
                  <option key={id} value={id}>
                    {p.emoji} {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Formato">
              <select className={inputClass} value={form.formato} onChange={(e) => set('formato', e.target.value)}>
                <option value="texto">Texto</option>
                <option value="carrossel">Carrossel</option>
                <option value="imagem">Imagem</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                {Object.entries(STATUS_INFO).map(([id, s]) => (
                  <option key={id} value={id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={`Corpo do post (${form.corpo.length}/${CORPO_LIMITE})`}>
            <textarea
              className={`${inputClass} h-72 resize-y font-mono text-[13px] leading-relaxed ${corpoLongo ? 'border-rose-500' : ''}`}
              value={form.corpo}
              onChange={(e) => set('corpo', e.target.value)}
            />
          </Field>
          <div className="-mt-2 flex justify-between text-xs">
            <span className={hookLongo ? 'text-rose-400' : 'text-zinc-500'}>
              Hook (1ª linha): {primeiraLinha.length}/{HOOK_LIMITE} caracteres antes do "ver mais"
            </span>
            {corpoLongo && <span className="text-rose-400">Corpo acima do limite do LinkedIn</span>}
          </div>

          <Field label="Hashtags (separadas por espaço)">
            <input
              className={inputClass}
              value={form.hashtags.join(' ')}
              onChange={(e) => set('hashtags', e.target.value.split(/\s+/).filter(Boolean))}
            />
          </Field>

          <Field label="Link do 1º comentário (não vai no corpo)">
            <input
              className={inputClass}
              value={form.link_primeiro_comentario}
              onChange={(e) => set('link_primeiro_comentario', e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>

        {/* coluna de preview */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Pré-visualização (LinkedIn)</p>
          <div className="rounded-xl border border-zinc-700 bg-white p-4 text-zinc-900 shadow-lg">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-lg font-bold text-white">
                H
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Hector Mauvecin Junior</div>
                <div className="text-xs text-zinc-500">Tecnologia · Agora · 🌎</div>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              <span>{visivel}</span>
              {resto && (
                <>
                  <span className="font-medium text-zinc-500"> …ver mais</span>
                  <span className="text-zinc-400">{resto}</span>
                </>
              )}
            </div>
            {form.hashtags.length > 0 && (
              <div className="mt-2 text-sm font-medium text-sky-600">{form.hashtags.join(' ')}</div>
            )}
            {form.link_primeiro_comentario && (
              <div className="mt-3 flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-500">
                <Link2 size={12} /> 1º comentário: {form.link_primeiro_comentario}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <Badge color={info.cor}>
              {info.emoji} {info.label}
            </Badge>
            <span>·</span>
            <span>{form.formato}</span>
            {form.hook_type && (
              <>
                <span>·</span>
                <span>hook: {form.hook_type}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
