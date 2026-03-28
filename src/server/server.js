const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// In-memory room state: roomId -> { conflictContext, clients: Map<socketId, userId>, draft, resolved: Set }
const rooms = new Map()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }
  })

  io.on('connection', (socket) => {
    const { roomId, userId, userName } = socket.handshake.query

    if (!roomId || !userId) {
      socket.disconnect()
      return
    }

    // Create room if it doesn't exist yet
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        clients: new Map(),
        draft: '',
        resolved: new Set(),
        conflictContext: null
      })
    }

    const room = rooms.get(roomId)
    room.clients.set(socket.id, { userId, userName: userName || 'Someone' })
    socket.join(roomId)

    // Broadcast updated presence to everyone in the room
    const presence = Array.from(room.clients.values())
    io.to(roomId).emit('presence', presence)

    // Send current draft to the newly joined user
    socket.emit('draft_sync', { draft: room.draft })

    // ── Draft sync ──────────────────────────────────────────────
    socket.on('draft_update', ({ draft }) => {
      room.draft = draft
      // Broadcast to everyone EXCEPT the sender
      socket.to(roomId).emit('draft_update', { draft })
    })

    // ── Conflict context (sent once when host joins) ─────────────
    socket.on('set_context', ({ context }) => {
      room.conflictContext = context
      socket.to(roomId).emit('context_received', { context })
    })

    // ── Mark resolved ────────────────────────────────────────────
    socket.on('mark_resolved', () => {
      room.resolved.add(userId)
      io.to(roomId).emit('resolve_status', { count: room.resolved.size, total: room.clients.size })

      if (room.resolved.size >= 2) {
        io.to(roomId).emit('session_complete', { finalDraft: room.draft })
        // Clean up after 60s
        setTimeout(() => rooms.delete(roomId), 60_000)
      }
    })

    // ── Typing indicator ─────────────────────────────────────────
    socket.on('typing', ({ isTyping }) => {
      socket.to(roomId).emit('typing', { userId, userName: room.clients.get(socket.id)?.userName, isTyping })
    })

    // ── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      room.clients.delete(socket.id)
      const updatedPresence = Array.from(room.clients.values())
      io.to(roomId).emit('presence', updatedPresence)
      if (room.clients.size === 0) {
        setTimeout(() => {
          if (rooms.get(roomId)?.clients.size === 0) rooms.delete(roomId)
        }, 300_000) // clean up empty rooms after 5 min
      }
    })
  })

  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`> Ready on http://${hostname}:${PORT}`)
  })
})