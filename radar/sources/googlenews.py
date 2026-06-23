"""Coletor: Google News RSS por consulta (PT-BR). Sem chave, ilimitado."""
from __future__ import annotations

import time
import urllib.parse
from datetime import datetime, timezone
from typing import Optional

import feedparser

from ..models import Candidato

BASE = "https://news.google.com/rss/search"


def coletar(query: str, pilar: str, limite: int = 10) -> list[Candidato]:
    q = urllib.parse.quote(query)
    url = f"{BASE}?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419"
    feed = feedparser.parse(url)
    candidatos: list[Candidato] = []
    for entry in feed.entries[:limite]:
        candidatos.append(
            Candidato(
                titulo=entry.get("title", ""),
                url=entry.get("link", ""),
                fonte="googlenews",
                pilar=pilar,
                popularidade=0.0,
                data=_data_iso(entry),
                resumo=query,
            )
        )
    return candidatos


def _data_iso(entry) -> Optional[str]:
    parsed = entry.get("published_parsed")
    if not parsed:
        return None
    return datetime.fromtimestamp(time.mktime(parsed), tz=timezone.utc).isoformat()
