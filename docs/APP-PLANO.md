# 🖥️ Plano do App (Dashboard + Editor) — e decisões autônomas

Documento escrito **antes** de construir o app, durante uma sessão autônoma (auto-aceite ligado).
Registra a arquitetura, as decisões que tomei sozinho e as **perguntas que eu faria ao Hector** —
com a resposta que escolhi e o porquê. Revisão: **2026-06-23**.

---

## 1. O que o Hector pediu

- Uma **interface visual em React**, rodável ("no ar"), navegável.
- Um **editor de texto** para escrever/copiar/colar e **subir imagens e arquivos**; e que esses
  arquivos **se repliquem na pasta local** do projeto, pra eu poder lê-los depois e fazer dinâmicas.
- Um **dashboard** de organização e planejamento, com **insights** e navegação.
- Capricho: pesquisar referências, planejar com calma, documentar e ser honesto sobre trade-offs.

## 2. Arquitetura

```
┌──────────────────────────────┐      HTTP/JSON      ┌──────────────────────────────┐
│  Frontend — React + Vite      │  <───────────────>  │  Backend — FastAPI            │
│  Tailwind v4 · lucide · router │                     │  uvicorn · CORS               │
│  Recharts (gráficos)          │                     │                               │
│                               │                     │  /api/pillars  /api/sources   │
│  Páginas:                     │                     │  /api/trends   /api/posts     │
│  · Dashboard (insights)       │                     │  /api/uploads  /api/radar/run │
│  · Tendências (briefing)      │                     │  /api/stats                   │
│  · Posts + Editor             │                     └───────────────┬───────────────┘
│  · Calendário editorial       │                                     │ lê/escreve
│  · Arquivos (upload)          │                       ┌─────────────▼──────────────┐
└──────────────────────────────┘                       │  content/ (fonte de verdade) │
                                                        │  posts.json · pillars.json   │
                                                        │  trends/*.json · uploads/*   │
                                                        └──────────────────────────────┘
```

O backend é a ponte entre o app e os arquivos locais em `content/` — é o que permite que um upload
no navegador "apareça" na pasta do projeto (atendendo o pedido do Hector).

## 3. Stack e decisões (com justificativa)

| Decisão | Escolha | Por quê |
|---|---|---|
| Frontend | **React + Vite + TypeScript** | Padrão moderno, rápido, type-safe; combina com a stack do Hector. |
| Estilo | **Tailwind v4** + componentes próprios + **lucide-react** | Tailwind v4 é o que o Hector já usa (projeto Fábrica de Sites). Ver decisão D2. |
| Gráficos | **Recharts** | Default moderno para dashboards React; leve e declarativo. |
| Navegação | **react-router-dom** | Múltiplas páginas navegáveis. |
| Backend | **FastAPI + uvicorn** | Decisão da Fase 1; rápido, tipado, ótimo p/ servir arquivos e API. |
| Armazenamento | **Arquivos JSON em `content/`** | Ver decisão D4. |

## 4. Perguntas abertas — respondidas por mim (auto-aceite) com justificativa

> O Hector pediu para eu documentar dúvidas, a resposta que escolhi e o porquê. Ele revisa depois.

**D1 — Publicar online (deploy) ou rodar local?**
→ **Rodar local (localhost).** Por quê: um deploy público de verdade precisa (a) de uma conta dele
em Vercel/Netlify (frontend) e Render/Railway (backend), e (b) decidir sobre custo/credenciais —
escolhas que são dele. O objetivo imediato ("ver no React") é 100% atendido rodando local. Deixei
um script de start pronto. *Pergunta para depois: quer que eu publique? Em qual serviço?*

**D2 — shadcn/ui ou componentes próprios?**
→ **Componentes próprios sobre Tailwind v4.** Por quê: o CLI do shadcn é interativo e arriscado numa
sessão sem o usuário presente; componentes próprios me dão controle total do visual agora. Como
ambos assentam sobre Tailwind, migrar para shadcn depois é tranquilo. *Trade-off honesto: perdi a
acessibilidade/qualidade "de fábrica" do Radix que vem com o shadcn.*

**D3 — Editor rich-text (negrito etc.) ou texto plano?**
→ **Texto plano com preview + contador + destaque de hook.** Por quê: o LinkedIn **não aceita**
markdown/HTML no corpo — é texto plano com quebras de linha. Um editor plano fiel ao que será colado
vale mais que um rich-text que iludiria o usuário. (Negrito "unicode" do LinkedIn fica como ideia futura.)

**D4 — Banco de dados ou arquivos?**
→ **Arquivos JSON em `content/`.** Por quê: ferramenta local, single-user; arquivos são simples,
versionáveis no Git e já são a "fonte de verdade" que eu leio nas sessões. Um banco seria over-engineering.

**D5 — Autenticação?**
→ **Nenhuma.** Por quê: uso local e pessoal. Auth só faria sentido se virar serviço online (ligado a D1).

**D6 — Onde salvar uploads e como "replicar na pasta"?**
→ **`content/uploads/`**, servidos como estáticos pelo backend. É exatamente o "replicar na pasta
local" pedido: o arquivo enviado pelo navegador é gravado no disco do projeto, e eu consigo lê-lo
depois. Imagens grandes/binárias ficam fora do versionamento se necessário (ver `.gitignore`).

## 5. Páginas e funcionalidades

1. **Dashboard** — cartões de insight (total de posts por status, distribuição por pilar, próximas
   janelas de postagem) + gráficos (Recharts) + lembretes de boas práticas do algoritmo.
2. **Tendências** — mostra o briefing mais recente do radar (oportunidades por pilar, score, link)
   e um botão para **rodar o radar** (gera briefing novo).
3. **Posts** — lista os 10+ posts; abre o **Editor** com: preview estilo LinkedIn, contador de
   caracteres (alerta no limite do hook ~210 e do corpo ~3000), destaque do hook, botão **copiar**,
   campos de hashtags/formato/status, e link do 1º comentário.
4. **Calendário** — visão de planejamento semanal; arrastar posts para dias (ou marcar data/hora).
5. **Arquivos** — upload de imagens/arquivos (drag-and-drop), com galeria do que já subiu.

## 6. Honestidade — o que fica bom e o que dá para melhorar

- ✅ Fica bom: navegação completa, dashboard com dados reais do `content/`, editor útil de verdade
  (preview + copiar + contador), upload que replica no disco, gráficos.
- ⚠️ A melhorar depois: acessibilidade (sem Radix/shadcn), testes automatizados, agendamento real
  (hoje é planejamento manual), geração de imagens/carrossel (Fase 2), deploy público (D1),
  e autenticação se virar online.

## 7. Como rodar (resumo; detalhe no README)

```bash
# backend
.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
# frontend
cd frontend && npm install && npm run dev   # http://localhost:5173
```
Ou usar o script único `start.ps1` (criado na validação).
