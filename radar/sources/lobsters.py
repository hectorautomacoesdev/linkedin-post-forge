"""Coletor: Lobsters — hottest stories (comunidade tech). Sem chave.

Fonte tech com curadoria diferente do Hacker News (mais foco em engenharia/linguagens),
o que ajuda a diversificar e evitar repetição de pauta.
"""
from __future__ import annotations

import httpx

from ..models import Candidato

URL = "https://lobste.rs/hottest.json"
HEADERS = {"User-Agent": "linkedin-post-forge/0.1"}


def coletar(limite: int = 25, pilar: str = "tech") -> list[Candidato]:
    with httpx.Client(timeout=15, headers=HEADERS) as client:
        stories = client.get(URL).json()
    candidatos: list[Candidato] = []
    for s in stories[:limite]:
        candidatos.append(
            Candidato(
                titulo=s.get("title", ""),
                url=s.get("url") or s.get("comments_url", ""),
                fonte="lobsters",
                pilar=pilar,
                popularidade=float(s.get("score", 0)),
                data=s.get("created_at"),
                resumo=" ".join(s.get("tags", []) or []),
            )
        )
    return candidatos
