export interface Post {
  id: string
  titulo: string
  pilar: string
  papel: string
  formato: string
  hook_type: string
  hook: string
  corpo: string
  hashtags: string[]
  link_primeiro_comentario: string
  status: string
  origem?: string
}

export interface Pillar {
  id: string
  nome: string
  papel: string
  peso: number
  keywords: string[]
}

export interface Opportunity {
  pilar: string
  titulo: string
  fonte: string
  url: string
  popularidade: number
  score: number
  angulo_sugerido: string
  hook_sugerido: string
  data?: string
  resumo?: string
}

export interface Briefing {
  gerado_em?: string
  total_candidatos?: number
  oportunidades: Opportunity[]
}

export interface Stats {
  total_posts: number
  por_status: Record<string, number>
  por_pilar: Record<string, number>
  total_oportunidades: number
  briefing_em?: string
}

export interface UploadItem {
  nome: string
  url: string
  tamanho: number
}
