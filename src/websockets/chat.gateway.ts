import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('ChatGateway initialized');
  }

  handleConnection(client: Socket) {
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
