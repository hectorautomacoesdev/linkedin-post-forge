"""Estruturas de dados do radar de tendências."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class Candidato:
    """Item bruto coletado de uma fonte, antes da pontuação."""

    titulo: str
    url: str
    fonte: str
    pilar: str
    popularidade: float = 0.0  # métrica bruta da fonte (pontos, reações, trending...)
    data: Optional[str] = None  # ISO 8601, quando a fonte fornece
    resumo: str = ""

    def dict(self) -> dict:
        return asdict(self)


@dataclass
class Oportunidade:
    """Candidato já pontuado e enriquecido para entrar no briefing."""

    pilar: str
    titulo: str
    fonte: str
    url: str
    popularidade: float
    score: float
    angulo_sugerido: str
    hook_sugerido: str
    data: Optional[str] = None
    resumo: str = ""

    def dict(self) -> dict:
        return asdict(self)
