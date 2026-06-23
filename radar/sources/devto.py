"""Coletor: Dev.to — artigos mais populares dos últimos 7 dias. Sem chave."""
from __future__ import annotations

import httpx

from ..models import Candidato

URL = "https://dev.to/api/articles"
HEADERS = {"User-Agent": "linkedin-post-forge/0.1"}


def coletar(limite: int = 30, pilar: str = "tech") -> list[Candidato]:
    params = {"top": 7, "per_page": limite}
    with httpx.Client(timeout=15, headers=HEADERS) as client:
        artigos = client.get(URL, params=params).json()
    candidatos: list[Candidato] = []
    for a in artigos:
        candidatos.append(
            Candidato(
                titulo=a.get("title", ""),
                url=a.get("url", ""),
                fonte="devto",
                pilar=pilar,
                popularidade=float(a.get("positive_reactions_count", 0)),
                data=a.get("published_at"),
                resumo=" ".join(a.get("tag_list", []) or []),
            )
        )
    return candidatos
