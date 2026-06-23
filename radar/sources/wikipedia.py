"""Coletor: Wikipedia 'neste dia' — REST v1, idioma pt. Sem chave."""
from __future__ import annotations

from datetime import datetime

import httpx

from ..models import Candidato

BASE = "https://pt.wikipedia.org/api/rest_v1/feed/onthisday/events"
HEADERS = {
    "User-Agent": "linkedin-post-forge/0.1 (https://github.com/hectorautomacoesdev/linkedin-post-forge)"
}


def coletar(limite: int = 15, pilar: str = "historia") -> list[Candidato]:
    hoje = datetime.now()
    url = f"{BASE}/{hoje.month:02d}/{hoje.day:02d}"
    resp = httpx.get(url, headers=HEADERS, timeout=15)
    eventos = resp.json().get("events", [])[:limite]
    candidatos: list[Candidato] = []
    for ev in eventos:
        ano = ev.get("year", "")
        texto = ev.get("text", "")
        pages = ev.get("pages", []) or []
        link = ""
        if pages:
            link = (
                pages[0].get("content_urls", {}).get("desktop", {}).get("page", "")
            )
        candidatos.append(
            Candidato(
                titulo=f"{ano}: {texto}",
                url=link,
                fonte="wikipedia_onthisday",
                pilar=pilar,
                popularidade=0.0,
                resumo=texto,
            )
        )
    return candidatos
