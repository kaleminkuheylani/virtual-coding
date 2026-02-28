# Virtual Coding IDE

Next.js 15 + React 18 tabanlı web IDE iskeleti.

## Özellikler
- Plan bazlı paket/AI limit yönetimi
- API route'lar: files, terminal execute, AI, health
- WebSocket terminal sunucusu (`backend/server.ts`)
- Railway + Supabase başlangıç konfigürasyonu

## Backend + UI birlikte çalıştırma
Projede iki ayrı runtime var:
- **Web/UI (Next.js)**: varsayılan olarak `3000`
- **Terminal WebSocket backend**: varsayılan olarak `3001`

### 1) Bağımlılıkları kur
```bash
bun install
```

### 2) Her ikisini tek komutla başlat
```bash
bun run dev:all
```

Alternatif olarak ayrı terminallerde:
```bash
bun run dev:web
bun run dev:backend
```

## Scriptler
- `bun run dev:web` → Next.js UI
- `bun run dev:backend` → WebSocket terminal backend (hot reload)
- `bun run dev:all` → UI + backend aynı anda
- `bun run backend:start` → backend production benzeri tek seferlik başlatma

## Ortam değişkenleri
- `WS_PORT`: WebSocket backend portu (default: `3001`)
- `WORKSPACE_ROOT`: Terminal oturumlarının açılacağı kök klasör (default: `/workspace/demo-user`)
