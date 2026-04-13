import { io, Socket } from 'socket.io-client'

import { ClientToServerEvents, ServerToClientEvents } from '~/type/socket'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(process.env.NEXT_PUBLIC_SOCKET_ORIGIN_URL, {
    withCredentials: true,
    autoConnect: false,
})

export default socket
