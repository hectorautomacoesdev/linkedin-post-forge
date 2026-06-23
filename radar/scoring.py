"""Filtragem e pontuação dos candidatos contra os pilares de conteúdo.

score = relevância (palavras-chave) × recência × popularidade, modulado pelo peso do pilar.
A pontuação é só um *ranking* de matéria-prima — o julgamento fino é feito na redação.
"""
from __future__ import annotations

import math
import unicodedata
from datetime import datetime, timezone
from typing import Optional

from .models import Candidato, Oportunidade


def _normalizar(texto: str) -> str:
    """Minúsculas e sem acentos, para casar palavras-chave de forma robusta."""
    texto = texto.lower()
    texto = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in texto if not unicodedata.combining(c))


def _relevancia(texto: str, keywords: list[str]) -> float:
    """Fração de palavras-chave do pilar presentes no texto (0..1, saturando em 2)."""
    if not keywords:
        return 0.5  # fonte intrínseca ao pilar (ex.: AniList = anime)
    alvo = _normalizar(texto)
    achadas = sum(1 for kw in keywords if _normalizar(kw) in alvo)
    return min(1.0, achadas / 2.0)


def _recencia(data_iso: Optional[str]) -> float:
    """1.0 = hoje; cai pela metade a cada ~3 dias. Neutro quando não há data."""
    if not data_iso:
        return 0.6
    try:
        dt = datetime.fromisoformat(data_iso.replace("Z", "+00:00"))
    except ValueError:
        return 0.6
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    idade_dias = (datetime.now(timezone.utc) - dt).total_seconds() / 86400
    return 0.5 ** (max(0.0, idade_dias) / 3.0)


def _popularidade_norm(valor: float) -> float:
    """Normaliza a métrica bruta via log: ~1000 pontos ≈ 1.0."""
    if valor <= 0:
        return 0.3  # neutro quando a fonte não expõe métrica
    return min(1.0, math.log10(valor + 1) / 3.0)


# Pontos de partida por pilar (eu ajusto o tom final na redação).
_HOOK_POR_PILAR = {
    "tech": "lista | contrário",
    "games": "história pessoal | pergunta",
    "anime": "história pessoal | pergunta",
    "natacao": "história pessoal | afirmação ousada",
    "robotica": "afirmação ousada | pergunta",
    "historia": "afirmação ousada | lista",
}

_ANGULO_POR_PILAR = {
    "tech": "sua opinião técnica + mini-tutorial ou aprendizado do dia",
    "games": "paralelo entre o jogo e carreira/aprendizado",
    "anime": "lição do anime aplicada a tecnologia/carreira",
    "natacao": "disciplina/consistência da natação aplicada à carreira",
    "robotica": "o que isso muda no futuro do trabalho e da tecnologia",
    "historia": "neste dia na história da tecnologia + lição para hoje",
}


def pontuar(cand: Candidato, pilar: dict) -> Oportunidade:
    rel = _relevancia(f"{cand.titulo} {cand.resumo}", pilar.get("keywords", []))
    rec = _recencia(cand.data)
    pop = _popularidade_norm(cand.popularidade)
    peso = pilar.get("peso", 0.1)
    score = (0.55 * rel + 0.25 * rec + 0.20 * pop) * (0.7 + 0.6 * peso)
    return Oportunidade(
        pilar=cand.pilar,
        titulo=cand.titulo,
        fonte=cand.fonte,
        url=cand.url,
        popularidade=cand.popularidade,
        score=round(score, 4),
        angulo_sugerido=_ANGULO_POR_PILAR.get(cand.pilar, "opinião pessoal"),
        hook_sugerido=_HOOK_POR_PILAR.get(cand.pilar, "pergunta"),
        data=cand.data,
        resumo=cand.resumo,
    )
