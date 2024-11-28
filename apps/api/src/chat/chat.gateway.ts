// src/chat/chat.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, OnGatewayConnection, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtPayload } from '@/auth/interfaces/jwt-payload.interface';
import { RoomsService } from './rooms.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    private readonly roomsService: RoomsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.warn('No token provided during connection handshake');
      client.disconnect();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, { secret });
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
    } catch (err) {
      this.logger.error('Token verification failed:', err.message);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    message: { id: string; senderId: string; receiverId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      'Received message from:',
      message.senderId,
      'to:',
      message.receiverId,
    );

    try {
      // Prevent sending a message to oneself
      if (message.senderId === message.receiverId) {
        console.error('Sender and receiver cannot be the same.');
        return;
      }

      const sender = await this.chatService.getUserById(message.senderId);
      const receiver = await this.chatService.getUserById(message.receiverId);

      // Ensure that the chat is only between an employer and a freelancer
      if (
        (sender.role === 'freelancer' && receiver.role === 'employer') ||
        (sender.role === 'employer' && receiver.role === 'freelancer')
      ) {
        // Check if a room already exists between the sender and receiver
        let room = await this.chatService.findRoomBetweenUsers(sender, receiver);

        if (!room) {
          // Create a new room if one doesn't exist
          room = await this.roomsService.createRoom(
            sender.id,
            receiver.id,
            `${sender.username}-${receiver.username}`,
          );
        }

        // Save the message to the database
        const savedMessage = await this.chatService.sendMessageWithId(
          sender,
          receiver,
          message.text,
          message.id,
        );
        console.log('Emitting saved message:', savedMessage);

        // Emit the saved message to both sender and receiver rooms
        this.server
          .to([message.senderId, message.receiverId])
          .emit('receiveMessage', {
            id: savedMessage.id,
            senderId: savedMessage.sender.id,
            receiverId: savedMessage.receiver.id,
            text: savedMessage.message,
            timestamp: savedMessage.createdAt,
            isRead: savedMessage.isRead,
          });
      } else {
        console.error(
          'Invalid chat roles: Chats can only occur between an employer and a freelancer',
        );
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  // Handle joining rooms
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Join the client to the specified room
      client.join(data.roomId);
      this.logger.log(`Received joinRoom event for room ID: ${data.roomId} from user ID: ${client.data.userId}`);
    } catch (error) {
      this.logger.error('Error joining room:', error.message);
    }
  }

  // Handle marking messages as read
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId } = data;
    try {
      await this.chatService.markMessagesAsRead(senderId, receiverId);

      // Notify the sender that their messages have been read
      this.server.to(senderId).emit('messagesRead', { senderId, receiverId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}


