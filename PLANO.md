# 📐 Plano — LinkedIn Post Forge

Documento de planejamento. Evolui a cada sessão. Última revisão: **2026-06-23**.

---

## 1. Objetivo

Criar uma ferramenta que ajude o Hector a **publicar com consistência e estratégia no LinkedIn**,
gerando posts otimizados prontos para copiar/colar, e que ao mesmo tempo **sirva de portfólio**
para a busca por uma vaga em tecnologia.

Sem automação de postagem (por ora): a ferramenta entrega o material pronto; o post é feito à mão.

## 2. Decisões já tomadas (sessão 1)

| Decisão | Escolha |
|---|---|
| Nome / repositório | `linkedin-post-forge` — **público** |
| Stack | **Python (FastAPI)** no backend + **React (Vite)** no frontend |
| Motor de conteúdo | **Gerado nas sessões com o Claude Code** (sem custo de API). A ferramenta organiza, formata, versiona e exporta. |
| Postagem | Manual (copiar/colar). Sem automação de publicação. |

## 3. Insights do algoritmo do LinkedIn (2026) — base de design

Resumo da pesquisa que orienta as regras embutidas na ferramenta:

- **Grafo de interesse (motor 360Brew):** alcance depende de *relevância de tópico + autoridade*,
  não do tamanho da rede. → Rede pequena não é obstáculo; consistência temática é o que conta.
- **Frequência:** 3–5 posts/semana; **qualidade ≫ quantidade**.
- **Janela ideal:** terça a quinta, 7–9h ou ~12h.
- **Primeiros 60–90 min decidem ~70% do alcance** → engajamento cedo (comentários) é crítico.
- **Formatos por engajamento:** carrossel/documento (mais alto) > vídeo nativo > imagem+texto > texto puro.
  **Link externo no corpo = ~−60% de alcance → colocar link sempre no 1º comentário.**
- **Sinais mais fortes:** *dwell time* (tempo lendo) e **saves** (salvamentos).
- **Hook:** as 2 primeiras linhas (~210 caracteres) decidem ~80%. Tipos que mais performam:
  história pessoal (4x) · contrário (3x) · lista numerada (2,5x) · afirmação ousada (2x) · pergunta (1,8x).
- **Para recrutadores:** mostrar **conquistas concretas** (ferramentas, workflows, resultados);
  posts < 200 palavras com CTA; comentar em posts de recrutadores das empresas-alvo.

## 4. Pilares de conteúdo do Hector

Misturar tech com interesses pessoais cria autenticidade (que o algoritmo de 2026 premia):

1. **Tecnologia & programação** — Python, .NET, React, JavaScript; bastidores dos projetos (Fábrica de Sites, Lab de Raspagem, este).
2. **Games & anime / animação** — paralelos entre games/anime e carreira, design, narrativa.
3. **Natação & esportes** — disciplina, consistência, performance aplicadas à carreira.
4. **Robótica** — automação, sistemas, curiosidades.
5. **História** — analogias históricas com tecnologia e mercado.

> Estratégia recomendada: ~70% tech (autoridade na área-alvo) + ~30% pessoal (humaniza e diferencia).

## 5. Arquitetura (proposta)

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│  Frontend (React + Vite)    │  HTTP  │  Backend (FastAPI)        │
│  - Calendário editorial     │ <────> │  - Serve pilares/temas    │
│  - Editor/preview do post   │        │  - Biblioteca de hooks    │
│  - Botão "copiar"           │        │  - CRUD de posts          │
│  - Download de imagens      │        │  - Export (md / imagem)   │
└─────────────────────────────┘        └────────────┬─────────────┘
                                                     │ lê/escreve
                                          ┌──────────▼─────────────┐
                                          │  /content (arquivos)    │
                                          │  posts gerados (md/json)│
                                          │  hooks, templates, temas│
                                          └─────────────────────────┘
```

**Fluxo do "motor de conteúdo":** nas sessões, o Claude Code gera os posts seguindo as regras do
item 3 e as grava como dados em `/content`. O backend serve esses dados; o frontend exibe de forma
agradável, com hook destacado, contagem de caracteres, formato sugerido e botão de copiar.

## 6. Estrutura de pastas (planejada — ainda não criada)

```
linkedin-post-forge/
├── README.md
├── PLANO.md
├── .gitignore
├── content/              # dados (gerados nas sessões)
│   ├── pillars.json      # pilares de conteúdo
│   ├── hooks.json        # biblioteca de hooks por tipo
│   ├── templates/        # modelos de post por formato
│   └── posts/            # posts prontos (1 arquivo por post)
├── backend/              # FastAPI
│   ├── app/
│   └── requirements.txt
└── frontend/             # React + Vite
    └── src/
```

## 7. Roadmap por fases

### Fase 0 — Planejamento ✅ (esta sessão)
- [x] Pesquisa do algoritmo do LinkedIn 2026
- [x] Criar pasta + repositório público
- [x] Escrever este plano

### Fase 1 — MVP de texto (grátis)
- [ ] **Radar de tendências** (coletor Python + scoring + briefing) — design e viabilidade em [`docs/RADAR-DE-TENDENCIAS.md`](./docs/RADAR-DE-TENDENCIAS.md)
- [ ] Modelar `content/` (pilares, hooks, templates)
- [ ] Backend FastAPI: endpoints de leitura + export markdown
- [ ] Frontend: lista de posts, preview com hook destacado, contador de caracteres, botão copiar
- [ ] Gerar o primeiro lote de posts reais nas sessões

### Fase 2 — Imagens & carrossel
- [ ] Geração de imagens/carrossel (formato de maior alcance)
- [ ] Possível integração com **Canva** (disponível neste ambiente) para os carrosséis
- [ ] Export de imagens prontas para download

### Fase 3 — Polimento & portfólio
- [ ] UI refinada (vira peça de portfólio)
- [ ] Calendário editorial visual
- [ ] Métricas/checklist de boas práticas por post
- [ ] (Opcional) integração com API da Claude para geração autônoma
