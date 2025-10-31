import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { AuthService } from 'src/auth/auth.service';

const isDev = process.env.NODE_ENV === 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

@WebSocketGateway({
  cors: isDev
    ? {
        origin: frontendUrl,
        credentials: true,
      }
    : undefined,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('[ChatGateway] ChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    const auth = client.handshake.auth as { accessToken?: string };

    const token = auth.accessToken;
    if (!token) {
      console.log('[ChatGateway] No access token provided');
      return client.disconnect();
    }

    const user = await this.authService.verifyToken(token);
    if (!user) {
      console.log('[ChatGateway] Invalid access token');
      return client.disconnect();
    }

    client.data = { user };

    await client.join(user.id.toString());

    const sockets = this.server.sockets.sockets;
    console.log(`[ChatGateway] Client connected: ${client.id}`);
    console.log(`[ChatGateway] Total connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.server.sockets.sockets;
    console.log(`[ChatGateway] Client disconnected: ${client.id}`);
    console.log(`[ChatGateway] Total connected clients: ${sockets.size}`);
  }

  sendUpdate(chatId: string, payload: any) {
    this.server.to(chatId).emit('messageUpdate', payload);
  }
}
