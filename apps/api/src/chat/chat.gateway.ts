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
import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService // Make sure JwtService is properly injected here
  ) {}

  async handleConnection(client: Socket, payload: JwtPayload) {
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.log(`User connected with ID: ${payload.sub}`);
      this.logger.warn('No token provided during connection handshake');
      client.disconnect();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const payload = this.jwtService.verify(token, { secret });
      client.data.userId = payload.sub;

      // Disconnect any existing connection for the user
      const existingSockets = await this.server.fetchSockets();
      existingSockets.forEach((socket) => {
        if (socket.data.userId === payload.sub && socket.id !== client.id) {
          socket.disconnect();
        }
      });

      // User joins their own room
      client.join(client.data.userId);

      this.logger.log(`User joined room: ${client.data.userId}`);
      this.logger.log(`User connected with ID: ${payload.sub}`);
    } catch (err) {
      this.logger.error('Token verification failed:', err.message);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
async handleSendMessage(
  @MessageBody() message: { id: string; senderId: string; receiverId: string; text: string },
  @ConnectedSocket() client: Socket
) {
  console.log('Received message from:', message.senderId, 'to:', message.receiverId);

  try {
    // Check if a message with this unique ID is already saved to avoid re-processing
    const existingMessage = await this.chatService.findMessageById(message.id);
    if (existingMessage) {
      console.log(`Message with ID ${message.id} already exists, skipping emission.`);      
      return;
    }

    const sender = await this.chatService.getUserById(message.senderId);
    const receiver = await this.chatService.getUserById(message.receiverId);

    // Save the message to the database
    const savedMessage = await this.chatService.sendMessageWithId(sender, receiver, message.text, message.id);
    console.log("Emitting saved message:", savedMessage);

    // Emit the saved message to both sender and receiver rooms
    this.server.to([message.senderId, message.receiverId]).emit('receiveMessage', {
      id: savedMessage.id,
      senderId: savedMessage.sender.id,
      receiverId: savedMessage.receiver.id,
      text: savedMessage.message,
      timestamp: savedMessage.createdAt,
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

}
