# 🔨 LinkedIn Post Forge

> Estúdio de publicações para LinkedIn — transforma os pilares de conteúdo e a stack do autor
> em posts otimizados (texto, carrossel, hashtags, calendário) **prontos para copiar e colar**.

**Status:** 🧭 Planejamento (Fase 0) — ainda sem código de aplicação. Veja o roadmap em [`PLANO.md`](./PLANO.md).

---

## Por que este projeto existe

Construído por [Hector Mauvecin Junior](https://www.linkedin.com/in/hectormauvecinjunior/) durante a
busca por uma vaga em tecnologia, com dois objetivos somados:

1. **Ferramenta útil** — manter uma presença consistente e estratégica no LinkedIn (o que o algoritmo
   de 2026 recompensa) sem gastar horas escrevendo cada post do zero.
2. **Peça de portfólio** — demonstrar, na prática, domínio de **Python (FastAPI)** e **React** e a
   capacidade de transformar uma necessidade real em produto.

## O que a ferramenta faz (visão)

- 🗓️ Sugere um **calendário editorial** (o que postar, em qual dia/horário ideal)
- ✍️ Monta o **texto do post** com um **hook** otimizado para os 2 primeiros (decisivos) segundos de leitura
- 🧩 Recomenda o **formato** (carrossel / texto / imagem), **hashtags** e **CTA**
- 🖼️ Prepara **imagens / carrosséis** para baixar (fase posterior)
- 📋 Entrega tudo **pronto para copiar e colar** — sem automação de postagem

> O "cérebro" criativo é gerado nas sessões de trabalho com o autor; a ferramenta cuida de
> organizar, formatar, versionar e exportar. (Detalhes e fases no `PLANO.md`.)

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python · FastAPI |
| Frontend | React · Vite |

## Rodar o app (dashboard + editor)

Interface visual em React (Vite + Tailwind) com backend FastAPI. Tem **Dashboard** (insights e
gráficos), **Tendências** (briefing do radar + botão para rodá-lo), **Posts** (lista + editor com
preview do LinkedIn, contador de caracteres e botão copiar), **Calendário** editorial e **Arquivos**
(upload que é salvo em `content/uploads/`).

```powershell
# jeito mais fácil (Windows): sobe backend + frontend juntos e abre o navegador
.\start.ps1
```

Ou manualmente, em dois terminais:

```bash
# 1) backend (a partir da raiz)
.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
# 2) frontend
cd frontend && npm install && npm run dev    # http://localhost:5173
```

Arquitetura e decisões de projeto em [`docs/APP-PLANO.md`](./docs/APP-PLANO.md).

## Como rodar o radar de tendências

O radar coleta o que está em alta nos temas do autor (5 fontes gratuitas, sem chave) e gera um
briefing diário de oportunidades em `content/trends/AAAA-MM-DD.json`.

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows (PowerShell: .venv\Scripts\Activate.ps1)
pip install -r requirements.txt
python -m radar.collect
```

Fontes do MVP: **Hacker News**, **Dev.to**, **AniList**, **Wikipedia "neste dia"** e **Google News RSS**.
Detalhes de design e viabilidade em [`docs/RADAR-DE-TENDENCIAS.md`](./docs/RADAR-DE-TENDENCIAS.md).

## Licença

A definir.
