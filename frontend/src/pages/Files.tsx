import { useRef, useState } from 'react'
import { Check, Copy, File as FileIcon, UploadCloud } from 'lucide-react'
import { api } from '../api'
import { useAsync } from '../lib/useAsync'
import { Card, PageHeader, Spinner } from '../components/ui'
import type { UploadItem } from '../types'

function tamanho(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

const ehImagem = (n: string) => /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(n)

export default function Files() {
  const { data, loading, reload } = useAsync<UploadItem[]>(api.uploads)
  const [enviando, setEnviando] = useState(false)
  const [arraste, setArraste] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function enviar(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return
    setEnviando(true)
    try {
      for (const f of Array.from(arquivos)) {
        await api.upload(f)
      }
      reload()
    } finally {
      setEnviando(false)
    }
  }

  async function copiarUrl(url: string) {
    await navigator.clipboard.writeText(window.location.origin + url)
    setCopiado(url)
    setTimeout(() => setCopiado(null), 1500)
  }

  const itens = data ?? []

  return (
    <div>
      <PageHeader
        title="Arquivos"
        subtitle="Suba imagens e arquivos — eles ficam salvos na pasta content/uploads do projeto."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArraste(true)
        }}
        onDragLeave={() => setArraste(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArraste(false)
          enviar(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition ${
          arraste ? 'border-sky-500 bg-sky-500/10' : 'border-zinc-700 hover:border-zinc-600'
        }`}
      >
        {enviando ? <Spinner /> : <UploadCloud size={32} className="text-zinc-500" />}
        <p className="mt-3 text-sm text-zinc-300">
          {enviando ? 'Enviando…' : 'Arraste arquivos aqui ou clique para selecionar'}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Imagens, PDFs, qualquer arquivo</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => enviar(e.target.files)}
        />
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      ) : itens.length === 0 ? (
        <Card className="p-10 text-center text-sm text-zinc-500">Nenhum arquivo enviado ainda.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {itens.map((it) => (
            <Card key={it.nome} className="overflow-hidden">
              <div className="flex h-36 items-center justify-center bg-zinc-950">
                {ehImagem(it.nome) ? (
                  <img src={it.url} alt={it.nome} className="h-full w-full object-cover" />
                ) : (
                  <FileIcon size={40} className="text-zinc-600" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-zinc-200" title={it.nome}>
                  {it.nome}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{tamanho(it.tamanho)}</span>
                  <button
                    onClick={() => copiarUrl(it.url)}
                    className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-sky-400"
                    title="Copiar URL"
                  >
                    {copiado === it.url ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    URL
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
