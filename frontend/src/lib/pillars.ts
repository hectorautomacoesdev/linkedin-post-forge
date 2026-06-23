export interface PilarInfo {
  label: string
  cor: string
  emoji: string
}

export const PILAR_INFO: Record<string, PilarInfo> = {
  tech: { label: 'Tecnologia', cor: '#38bdf8', emoji: '💻' },
  robotica: { label: 'Robótica', cor: '#a78bfa', emoji: '🤖' },
  games: { label: 'Games', cor: '#f472b6', emoji: '🎮' },
  anime: { label: 'Anime', cor: '#fb923c', emoji: '🎌' },
  natacao: { label: 'Natação', cor: '#34d399', emoji: '🏊' },
  historia: { label: 'História', cor: '#fbbf24', emoji: '📜' },
}

export function pilar(id: string): PilarInfo {
  return PILAR_INFO[id] ?? { label: id, cor: '#a1a1aa', emoji: '•' }
}

export const STATUS_INFO: Record<string, { label: string; cor: string }> = {
  rascunho: { label: 'Rascunho', cor: '#a1a1aa' },
  pronto: { label: 'Pronto', cor: '#34d399' },
  publicado: { label: 'Publicado', cor: '#38bdf8' },
}

export function status(id: string) {
  return STATUS_INFO[id] ?? { label: id, cor: '#a1a1aa' }
}
