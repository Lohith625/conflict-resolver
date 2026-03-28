import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(roomId: string, userId: string, userName: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      query: { roomId, userId, userName },
      transports: ['websocket'],
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
