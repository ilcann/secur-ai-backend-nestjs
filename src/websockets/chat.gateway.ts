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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // net origin belirt
    credentials: true, // cookie'ye izin ver
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('ChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      console.log('No cookies found');
      return client.disconnect();
    }
    const parsed = cookie.parse(cookies);
    const token = parsed['access_token'];
    if (!token) {
      console.log('No token found');
      return client.disconnect();
    }
    // Here you would normally validate the token and possibly fetch user info
    // For this example, we'll just log the connection

    const user = await this.authService.verifyToken(token);
    if (!user) {
      console.log('Invalid token');
      return client.disconnect();
    }

    client.data = { user };

    await client.join(user.id.toString());

    const sockets = this.server.sockets.sockets;
    console.log(`Client connected: ${client.id}`);
    console.log(`Total connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.server.sockets.sockets;
    console.log(`Client disconnected: ${client.id}`);
    console.log(`Total connected clients: ${sockets.size}`);
  }

  sendUpdate(chatId: string, payload: any) {
    this.server.to(chatId).emit('messageUpdate', payload);
  }
}
