"""Orquestrador do radar: coleta as fontes, pontua e gera o briefing diário.

Uso:
    python -m radar.collect
Gera content/trends/AAAA-MM-DD.json com as melhores oportunidades do dia.
"""
from __future__ import annotations

import collections
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

from .scoring import pontuar
from .sources import anilist, devto, googlenews, hackernews, wikipedia

RAIZ = Path(__file__).resolve().parent.parent
CONTENT = RAIZ / "content"
TRENDS_DIR = CONTENT / "trends"

# Fontes "fixas" (intrínsecas a um pilar) coletadas no máximo uma vez.
FONTES_FIXAS = {
    "hackernews": lambda: hackernews.coletar(pilar="tech"),
    "devto": lambda: devto.coletar(pilar="tech"),
    "anilist": lambda: anilist.coletar(pilar="anime"),
    "wikipedia_onthisday": lambda: wikipedia.coletar(pilar="historia"),
}


def _carregar_pilares() -> list[dict]:
    return json.loads((CONTENT / "pillars.json").read_text(encoding="utf-8"))


def _seguro(nome: str, fn) -> list:
    """Executa um coletor isolando falhas (uma fonte fora do ar não derruba o radar)."""
    try:
        itens = fn()
        print(f"  ok  {nome}: {len(itens)} itens")
        return itens
    except Exception as e:  # noqa: BLE001 - queremos resiliência por fonte
        print(f"  -- {nome}: falhou ({e})")
        return []


def coletar_tudo(pilares: list[dict]) -> list:
    candidatos: list = []
    usadas: set[str] = set()
    for p in pilares:
        for fonte in p.get("fontes", []):
            if fonte in FONTES_FIXAS and fonte not in usadas:
                usadas.add(fonte)
                candidatos += _seguro(fonte, FONTES_FIXAS[fonte])
        for q in p.get("google_news_queries", []):
            candidatos += _seguro(
                f"googlenews:{q}",
                lambda q=q, pid=p["id"]: googlenews.coletar(q, pid),
            )
    return candidatos


def _chave_titulo(titulo: str) -> str:
    """Título normalizado (sem acento/pontuação) para detectar duplicatas."""
    t = unicodedata.normalize("NFKD", titulo.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", t)


def _deduplicar(oportunidades: list) -> list:
    """Remove repetidos por URL ou por título (mantém o de maior score, que vem antes)."""
    urls_vistas: set[str] = set()
    titulos_vistos: set[str] = set()
    unicas = []
    for o in oportunidades:
        chave_url = (o.url or "").split("?")[0].lower()
        chave_titulo = _chave_titulo(o.titulo)
        if chave_url and chave_url in urls_vistas:
            continue
        if chave_titulo and chave_titulo in titulos_vistos:
            continue
        if chave_url:
            urls_vistas.add(chave_url)
        if chave_titulo:
            titulos_vistos.add(chave_titulo)
        unicas.append(o)
    return unicas


def _balancear(
    oportunidades: list, top: int, min_por_pilar: int, max_por_pilar: int
) -> list:
    """Diversidade por pilar: reserva uma cota mínima de cada tema e limita o máximo,
    para nenhum pilar dominar nem ficar de fora. Entrada já ordenada por score (desc)."""
    por_pilar: dict[str, list] = {}
    for o in oportunidades:
        por_pilar.setdefault(o.pilar, []).append(o)

    selecionadas: list = []
    # 1) reserva o mínimo de cada pilar (os de maior score dentro do tema)
    for itens in por_pilar.values():
        selecionadas.extend(itens[:min_por_pilar])

    # 2) completa por score global, respeitando o máximo por pilar
    ja = {id(o) for o in selecionadas}
    contagem = collections.Counter(o.pilar for o in selecionadas)
    for o in oportunidades:
        if len(selecionadas) >= top:
            break
        if id(o) in ja or contagem[o.pilar] >= max_por_pilar:
            continue
        selecionadas.append(o)
        contagem[o.pilar] += 1
        ja.add(id(o))

    selecionadas.sort(key=lambda o: o.score, reverse=True)
    return selecionadas[:top]


def gerar_briefing(
    top: int = 20, min_por_pilar: int = 2, max_por_pilar: int = 4
) -> dict:
    pilares = _carregar_pilares()
    por_id = {p["id"]: p for p in pilares}
    print("Coletando fontes...")
    candidatos = coletar_tudo(pilares)

    oportunidades = [
        pontuar(c, por_id.get(c.pilar, {"peso": 0.1, "keywords": []}))
        for c in candidatos
    ]
    oportunidades.sort(key=lambda o: o.score, reverse=True)
    oportunidades = _deduplicar(oportunidades)
    oportunidades = _balancear(oportunidades, top, min_por_pilar, max_por_pilar)

    return {
        "gerado_em": date.today().isoformat(),
        "total_candidatos": len(candidatos),
        "oportunidades": [o.dict() for o in oportunidades],
    }


def salvar(briefing: dict) -> Path:
    TRENDS_DIR.mkdir(parents=True, exist_ok=True)
    destino = TRENDS_DIR / f"{briefing['gerado_em']}.json"
    destino.write_text(
        json.dumps(briefing, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return destino


def main() -> None:
    briefing = gerar_briefing()
    destino = salvar(briefing)
    print(f"\nBriefing salvo em: {destino}")
    print(
        f"Candidatos: {briefing['total_candidatos']} | "
        f"Oportunidades: {len(briefing['oportunidades'])}\n"
    )
    print("Top 10 oportunidades:")
    for i, o in enumerate(briefing["oportunidades"][:10], 1):
        print(f"  {i:2d}. [{o['pilar']:8s}] {o['score']:.2f}  {o['titulo'][:70]}")


if __name__ == "__main__":
    main()
