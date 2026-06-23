"""Coletor: AniList — anime em alta via GraphQL (TRENDING_DESC). Sem chave."""
from __future__ import annotations

import httpx

from ..models import Candidato

URL = "https://graphql.anilist.co"
QUERY = """
query ($perPage: Int) {
  Page(perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME) {
      title { romaji english }
      trending
      siteUrl
      genres
    }
  }
}
"""


def coletar(limite: int = 15, pilar: str = "anime") -> list[Candidato]:
    resp = httpx.post(
        URL,
        json={"query": QUERY, "variables": {"perPage": limite}},
        timeout=15,
    )
    midias = resp.json().get("data", {}).get("Page", {}).get("media", [])
    candidatos: list[Candidato] = []
    for m in midias:
        titulo = m["title"].get("english") or m["title"].get("romaji") or "Anime"
        candidatos.append(
            Candidato(
                titulo=titulo,
                url=m.get("siteUrl", ""),
                fonte="anilist",
                pilar=pilar,
                popularidade=float(m.get("trending", 0)),
                resumo=" ".join(m.get("genres", []) or []),
            )
        )
    return candidatos
