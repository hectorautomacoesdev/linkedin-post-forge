"""Coletor: Hacker News — top stories via Firebase. Sem chave, sem rate limit."""
from __future__ import annotations

from datetime import datetime, timezone

import httpx

from ..models import Candidato

BASE = "https://hacker-news.firebaseio.com/v0"


def coletar(limite: int = 20, pilar: str = "tech") -> list[Candidato]:
    candidatos: list[Candidato] = []
    with httpx.Client(timeout=15) as client:
        ids = client.get(f"{BASE}/topstories.json").json()[:limite]
        for item_id in ids:
            try:
                item = client.get(f"{BASE}/item/{item_id}.json").json()
            except Exception:
                continue
            if not item or item.get("type") != "story" or not item.get("title"):
                continue
            ts = item.get("time")
            data = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else None
            candidatos.append(
                Candidato(
                    titulo=item["title"],
                    url=item.get("url") or f"https://news.ycombinator.com/item?id={item_id}",
                    fonte="hackernews",
                    pilar=pilar,
                    popularidade=float(item.get("score", 0)),
                    data=data,
                )
            )
    return candidatos
