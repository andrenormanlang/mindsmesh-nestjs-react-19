import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService, // Make sure JwtService is properly injected here
  ) {}

  async handleConnection(client: Socket) {
    // Get the token from the handshake authentication headers
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.warn('No token provided during connection handshake');
      client.disconnect();
      return;
    }
  
    try {
      const secret = process.env.JWT_SECRET; // Ensure you have this in your .env file
      if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
  
      // Verifying the token with the secret key
      this.logger.log('Attempting to verify token:', token);
      const payload = this.jwtService.verify(token, { secret });
  
      // Attach the userId to the client
      client.data.userId = payload.sub;
      client.join(client.data.userId);
      this.logger.log(`User connected with ID: ${payload.sub}`);
    } catch (err) {
      this.logger.error('Token verification failed:', err.message);
      client.disconnect();
    }
  }
  

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() message: { senderId: string; receiverId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Received message from:', message.senderId, 'to:', message.receiverId);

    try {
      const sender = await this.chatService.getUserById(message.senderId);
      const receiver = await this.chatService.getUserById(message.receiverId);

      const savedMessage = await this.chatService.sendMessage(sender, receiver, message.text);

      // Emit to receiver and sender
      this.server.to(message.receiverId).emit('receiveMessage', savedMessage);
      this.server.to(message.senderId).emit('receiveMessage', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
}
