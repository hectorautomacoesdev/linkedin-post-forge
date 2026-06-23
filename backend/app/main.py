"""API do LinkedIn Post Forge.

Serve e edita o conteúdo em `content/` para o frontend React, e expõe o radar de tendências.
Rode a partir da RAIZ do repositório:

    python -m uvicorn backend.app.main:app --reload --port 8000
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

RAIZ = Path(__file__).resolve().parents[2]
CONTENT = RAIZ / "content"
POSTS_FILE = CONTENT / "posts.json"
PILLARS_FILE = CONTENT / "pillars.json"
SOURCES_FILE = CONTENT / "sources.json"
TRENDS_DIR = CONTENT / "trends"
UPLOADS_DIR = CONTENT / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="LinkedIn Post Forge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos enviados ficam acessíveis em /uploads/<nome> (replicados no disco do projeto).
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# --------------------------------------------------------------------------- helpers
def _ler_json(caminho: Path, padrao):
    if not caminho.exists():
        return padrao
    return json.loads(caminho.read_text(encoding="utf-8"))


def _escrever_json(caminho: Path, dados) -> None:
    caminho.write_text(
        json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def _carregar_posts() -> list[dict]:
    return _ler_json(POSTS_FILE, [])


def _salvar_posts(posts: list[dict]) -> None:
    _escrever_json(POSTS_FILE, posts)


# --------------------------------------------------------------------------- modelos
class PostIn(BaseModel):
    titulo: Optional[str] = None
    pilar: Optional[str] = None
    papel: Optional[str] = None
    formato: Optional[str] = None
    hook_type: Optional[str] = None
    hook: Optional[str] = None
    corpo: Optional[str] = None
    hashtags: Optional[list[str]] = None
    link_primeiro_comentario: Optional[str] = None
    status: Optional[str] = None


# ---------------------------------------------------------------------------- rotas
@app.get("/api/health")
def health():
    return {"ok": True, "servico": "linkedin-post-forge"}


@app.get("/api/pillars")
def pillars():
    return _ler_json(PILLARS_FILE, [])


@app.get("/api/sources")
def sources():
    return _ler_json(SOURCES_FILE, {})


@app.get("/api/posts")
def listar_posts():
    return _carregar_posts()


@app.get("/api/posts/{post_id}")
def obter_post(post_id: str):
    for p in _carregar_posts():
        if p.get("id") == post_id:
            return p
    raise HTTPException(404, "Post não encontrado")


@app.put("/api/posts/{post_id}")
def atualizar_post(post_id: str, dados: PostIn):
    posts = _carregar_posts()
    for p in posts:
        if p.get("id") == post_id:
            p.update({k: v for k, v in dados.model_dump().items() if v is not None})
            _salvar_posts(posts)
            return p
    raise HTTPException(404, "Post não encontrado")


@app.post("/api/posts")
def criar_post(dados: PostIn):
    posts = _carregar_posts()
    ids = {p.get("id") for p in posts}
    n = len(posts) + 1
    while f"post-{n:02d}" in ids:
        n += 1
    novo = {
        "id": f"post-{n:02d}",
        "titulo": dados.titulo or "Novo post",
        "pilar": dados.pilar or "tech",
        "papel": dados.papel or "protagonista",
        "formato": dados.formato or "texto",
        "hook_type": dados.hook_type or "",
        "hook": dados.hook or "",
        "corpo": dados.corpo or "",
        "hashtags": dados.hashtags or [],
        "link_primeiro_comentario": dados.link_primeiro_comentario or "",
        "status": dados.status or "rascunho",
        "origem": "app",
    }
    posts.append(novo)
    _salvar_posts(posts)
    return novo


@app.delete("/api/posts/{post_id}")
def deletar_post(post_id: str):
    posts = _carregar_posts()
    novos = [p for p in posts if p.get("id") != post_id]
    if len(novos) == len(posts):
        raise HTTPException(404, "Post não encontrado")
    _salvar_posts(novos)
    return {"removido": post_id}


@app.get("/api/trends")
def listar_trends():
    if not TRENDS_DIR.exists():
        return []
    return sorted((f.stem for f in TRENDS_DIR.glob("*.json")), reverse=True)


@app.get("/api/trends/latest")
def trend_recente():
    if not TRENDS_DIR.exists():
        return {"oportunidades": []}
    arquivos = sorted(TRENDS_DIR.glob("*.json"), reverse=True)
    if not arquivos:
        return {"oportunidades": []}
    return _ler_json(arquivos[0], {"oportunidades": []})


@app.post("/api/radar/run")
def rodar_radar():
    """Roda o radar agora e gera um briefing novo (faz requisições de rede)."""
    try:
        from radar.collect import gerar_briefing, salvar

        briefing = gerar_briefing()
        salvar(briefing)
        return briefing
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"Falha ao rodar o radar: {e}")


@app.get("/api/uploads")
def listar_uploads():
    arquivos = []
    for f in sorted(UPLOADS_DIR.iterdir()):
        if f.is_file():
            arquivos.append(
                {
                    "nome": f.name,
                    "url": f"/uploads/{f.name}",
                    "tamanho": f.stat().st_size,
                }
            )
    return arquivos


@app.post("/api/uploads")
async def enviar_arquivo(arquivo: UploadFile = File(...)):
    nome_seguro = Path(arquivo.filename or "arquivo").name
    destino = UPLOADS_DIR / nome_seguro
    if destino.exists():  # não sobrescreve: cria sufixo incremental
        i = 1
        while (UPLOADS_DIR / f"{destino.stem}-{i}{destino.suffix}").exists():
            i += 1
        destino = UPLOADS_DIR / f"{destino.stem}-{i}{destino.suffix}"
    with destino.open("wb") as buffer:
        shutil.copyfileobj(arquivo.file, buffer)
    return {
        "nome": destino.name,
        "url": f"/uploads/{destino.name}",
        "tamanho": destino.stat().st_size,
    }


@app.get("/api/stats")
def stats():
    """Insights para o dashboard."""
    posts = _carregar_posts()
    por_status: dict[str, int] = {}
    por_pilar: dict[str, int] = {}
    for p in posts:
        por_status[p.get("status", "?")] = por_status.get(p.get("status", "?"), 0) + 1
        por_pilar[p.get("pilar", "?")] = por_pilar.get(p.get("pilar", "?"), 0) + 1
    trend = trend_recente()
    return {
        "total_posts": len(posts),
        "por_status": por_status,
        "por_pilar": por_pilar,
        "total_oportunidades": len(trend.get("oportunidades", [])),
        "briefing_em": trend.get("gerado_em"),
    }
