# 📡 Radar de Tendências — design e viabilidade

> Como a ferramenta vai **buscar o que está em alta** nos temas do Hector e transformar isso em
> posts. Documento de design + estudo de viabilidade das fontes. Revisão: **2026-06-23**.

---

## 1. O problema que isto resolve

O autor quer postar com consistência, puxando **assuntos em alta** que combinem com seus interesses
— e, quando não houver nada bom encaixando, partir para um ângulo próprio ("algo surpreendente",
normalmente os projetos dele). O Radar é o componente que faz essa garimpagem e me alimenta com
matéria-prima fresca para escrever.

## 2. Como um post nasce (o fluxo, esclarecido)

Quatro etapas. As 3 primeiras são automatizadas (Python); a redação é feita comigo nas sessões.

```
 (1) COLETA            (2) FILTRAGEM/SCORING        (3) REDAÇÃO              (4) VITRINE
 Python "radar"   ──►  Python casa com pilares  ──► EU, na sessão       ──► App (React)
 busca cada fonte      + recência + popularidade    escrevo o post a        mostra pronto
 por pilar             = "briefing de               partir do briefing      p/ copiar/colar
                        oportunidades" rankeado      (regras do algoritmo)
```

1. **Coleta** — o radar consulta cada fonte (ver tabela) e devolve candidatos brutos: título, URL,
   fonte, métrica de popularidade, data, pilar.
2. **Filtragem & scoring** — casa cada candidato com os pilares (palavras-chave) e calcula um
   `score = relevância × recência × popularidade`. Gera um **briefing** (`content/trends/AAAA-MM-DD.json`)
   com as melhores oportunidades, cada uma já com um ângulo e tipo de hook sugeridos.
3. **Redação (eu)** — leio o briefing + seus projetos/pilares e **escrevo os posts** seguindo as
   regras do algoritmo (hook nas 2 primeiras linhas, formato, hashtags, CTA, link no 1º comentário).
   Salvo em `content/posts/`. **É aqui que os posts são criados** — não do zero, mas a partir do
   briefing que o radar serviu.
4. **Vitrine** — o app exibe os posts prontos (preview + botão copiar) e o briefing de tendências.

> **Fallback "surpreendente":** se nenhuma oportunidade passar do limiar de relevância, eu gero um
> post *evergreen* sobre seus projetos ou um ângulo criativo cruzando pilares
> (ex.: *"o que a natação me ensinou sobre debugar código"*).

## 3. Fontes de tendências por pilar

| Pilar | Fonte recomendada | Chave? | Observação |
|---|---|---|---|
| **Tech/programação** | **Hacker News API** (Firebase) | ❌ não | Sem rate limit, oficial. Melhor fonte tech. |
| | **Dev.to API** (`/articles?top=7`) | ❌ não | Artigos populares por tag (python, react, dotnet, js). |
| | **GitHub Search API** | 🔑 token (já temos) | `created:>data sort:stars` aproxima "trending". Oficial. |
| | **arXiv** (cs.AI/cs.LG) | ❌ não | RSS/API oficial. Ganchos de pesquisa/IA. |
| **Games** | **RAWG API** | 🔑 grátis | Free tier ~20k req/mês. Lançamentos/populares. |
| **Anime/animação** | **AniList** (GraphQL) | ❌ não | ~90 req/min, oficial. Trending/seasonal. ⭐ melhor. |
| | Jikan (MyAnimeList) | ❌ não | REST, ~60 req/min. Complemento. |
| **Robótica** | **arXiv cs.RO** + IEEE Spectrum RSS | ❌ não | Pesquisa + notícias via RSS. |
| **História** | **Wikipedia "On this day"** (Wikimedia) | ❌ não | Eventos do dia → "neste dia na história da tech". ⭐ |
| **Natação/esportes** | **Google News RSS** + SwimSwam RSS | ❌ não | Não há API dedicada boa/grátis; RSS resolve (PT-BR). |
| **Coringa (todos)** | **Google News RSS** | ❌ não | Grátis, ilimitado, qualquer tema/idioma. Espinha dorsal. |

## 4. Viabilidade — o que evitar (e por quê)

- ❌ **pytrends / Google Trends (não-oficial):** repositório **arquivado em abr/2025**, instável
  (endpoints quebrados). Não usar. → substituímos por **Google News RSS** como proxy de "o que está
  sendo noticiado". (Há a API oficial do Google Trends, mas está em *alpha* com cotas limitadas.)
- ⚠️ **Reddit API:** grátis só para uso pessoal/pesquisa, com OAuth (60 req/min) ou sem OAuth
  (10 req/min). Uso comercial exige contrato pago. → no MVP, **pular** ou usar com parcimônia.
- ❌ **X/Twitter:** API cara/inviável para este uso. → **pular**.
- ⚠️ **GitHub Trending (página):** não tem API oficial → usamos a **GitHub Search API** (oficial) no
  lugar de raspar a página.

> **Veredito:** o radar é **totalmente viável e gratuito** para começar. A maioria dos pilares tem
> fonte **oficial, grátis e sem chave**. Pontos de atenção apenas em Google Trends (morto → usar RSS),
> Reddit/X (restritos → pular) e Games (RAWG pede uma chave grátis).

## 5. Bibliotecas Python

- `httpx` (ou `requests`) — chamadas HTTP/GraphQL.
- `feedparser` — RSS (espinha dorsal; sem chave, estável, ToS amigável).
- *(opcional, depois)* `praw` — Reddit, só se decidirmos incluir.

Prioridade para **APIs/RSS oficiais** por estabilidade e termos de uso; scraping fica como último
recurso e com cautela.

## 6. Modelo de dados (modelagem do conteúdo)

**`content/pillars.json`** — pilares, peso e palavras-chave (usadas no scoring):
```json
[
  {
    "id": "tech",
    "nome": "Tecnologia & Programação",
    "peso": 0.5,
    "keywords": ["python", "fastapi", ".net", "react", "javascript", "ia", "automação"],
    "fontes": ["hackernews", "devto", "github", "arxiv-ai", "googlenews"]
  }
]
```

**`content/sources.json`** — config de cada fonte (tipo, endpoint, precisa_chave, rate_limit).

**`content/trends/2026-06-23.json`** — briefing de oportunidades (saída do radar):
```json
{
  "gerado_em": "2026-06-23T20:00:00",
  "oportunidades": [
    {
      "pilar": "tech",
      "titulo": "Novo release do FastAPI",
      "fonte": "hackernews",
      "url": "https://...",
      "popularidade": 540,
      "score": 0.87,
      "angulo_sugerido": "sua opinião + mini-tutorial",
      "hook_sugerido": "contrário | lista"
    }
  ]
}
```

**`content/posts/2026-06-24-fastapi.md`** — post final (frontmatter + corpo):
```markdown
---
pilar: tech
formato: carrossel        # carrossel | texto | imagem
hook_type: contrario
status: pronto            # rascunho | pronto | publicado
hashtags: ["#python", "#fastapi", "#desenvolvimento"]
link_primeiro_comentario: "https://github.com/..."
origem_trend: "hackernews:Novo release do FastAPI"
---
(corpo do post, com o hook nas 2 primeiras linhas)
```

## 7. MVP do radar (o que codar na Fase 1)

Começar só com as fontes **grátis e sem chave**, cobrindo os 5 pilares já de cara:

| Fonte | Cobre | Custo/chave |
|---|---|---|
| Hacker News API | tech | grátis, sem chave |
| Dev.to API | tech | grátis, sem chave |
| AniList | anime/animação | grátis, sem chave |
| Wikipedia "On this day" | história | grátis, sem chave |
| Google News RSS | natação, robótica, games, coringa | grátis, sem chave |

Adicionar **depois** (pedem chave/setup): RAWG (games), GitHub Search, arXiv, IEEE RSS, Reddit.

Esforço estimado do MVP do radar: **baixo/médio** (algumas centenas de linhas Python).

## 8. Próximos passos propostos

1. Implementar o radar MVP (coletor + scoring + geração do briefing).
2. Criar os arquivos reais de `content/` (pillars, sources, hooks, templates).
3. Rodar o primeiro briefing e **escrever o primeiro lote de posts** juntos.
4. Subir o esqueleto FastAPI + React para exibir tudo.
