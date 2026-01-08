# Metaverse - Independent Apps

This branch contains three independent applications:

## Apps

### 1. Frontend (`apps/frontend`)
- Next.js 15 application
- User interface for the metaverse
- **Run**: `cd apps/frontend && npm install && npm run dev`

### 2. HTTP Server (`apps/http`)
- Express REST API
- Handles authentication, spaces, avatars, maps
- **Run**: `cd apps/http && npm install && npm run dev`

### 3. WebSocket Server (`apps/ws`)
- Real-time communication server
- Handles user movements, chat, WebRTC signaling
- **Run**: `cd apps/ws && npm install && npm run dev`

## Setup

Each app is completely independent with its own dependencies:

```bash
# Install frontend
cd apps/frontend
npm install

# Install HTTP server
cd apps/http
npm install

# Install WebSocket server
cd apps/ws
npm install
```

## Run All Services

```bash
# Terminal 1 - Frontend
cd apps/frontend && npm run dev

# Terminal 2 - HTTP API
cd apps/http && npm run dev

# Terminal 3 - WebSocket
cd apps/ws && npm run dev
```
