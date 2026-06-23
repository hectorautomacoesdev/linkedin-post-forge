# Sobe o LinkedIn Post Forge: backend (FastAPI) + frontend (Vite) em janelas separadas.
# Uso:  .\start.ps1
$raiz = $PSScriptRoot

if (-not (Test-Path "$raiz\.venv")) {
  Write-Host "Criando ambiente virtual Python..." -ForegroundColor Yellow
  python -m venv "$raiz\.venv"
  & "$raiz\.venv\Scripts\python.exe" -m pip install -q -r "$raiz\requirements.txt"
}
if (-not (Test-Path "$raiz\frontend\node_modules")) {
  Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
  Push-Location "$raiz\frontend"; npm install; Pop-Location
}

Write-Host "Iniciando backend  -> http://localhost:8000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$raiz'; .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000"
)

Write-Host "Iniciando frontend -> http://localhost:5173" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "cd '$raiz\frontend'; npm run dev"
)

Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
Write-Host ""
Write-Host "App no ar! Abra http://localhost:5173 (abre sozinho em instantes)." -ForegroundColor Green
Write-Host "Para parar: feche as duas janelas que abriram." -ForegroundColor DarkGray
