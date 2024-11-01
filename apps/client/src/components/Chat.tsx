import React, { useEffect, useState, useRef } from "react";
import { User } from "../types/types";
import { Button } from "./shadcn/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { X, Send, Loader2 } from "lucide-react";
import { sendMessage } from "../services/MindsMeshAPI";
import { io, Socket } from "socket.io-client";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat: React.FC<{ freelancer: User; onClose?: () => void }> = ({ 
  freelancer, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Array<{
    senderId: string;
    text: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderId = localStorage.getItem("userId");
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && senderId) {
      const newSocket = io("http://localhost:3000/api", {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnecting(false);
        console.log("Connected to socket");
      });

      newSocket.on("receiveMessage", (message) => {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(),
          status: 'sent'
        }]);
      });

      newSocket.on("connect_error", (err) => {
        setIsConnecting(false);
        console.error("Socket connection error:", err);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [senderId]);

  const handleSendMessage = async () => {
    if (!senderId || !newMessage.trim()) return;

    const messageObj = {
      senderId,
      receiverId: freelancer.id,
      text: newMessage.trim(),
      timestamp: new Date(),
      status: 'sending' as const
    };

    setMessages(prev => [...prev, messageObj]);
    setNewMessage("");

    try {
      await sendMessage(freelancer.id, messageObj.text);
      
      if (socket) {
        socket.emit("sendMessage", messageObj);
      }

      setMessages(prev => 
        prev.map(msg => 
          msg === messageObj 
            ? { ...msg, status: 'sent' as const } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg === messageObj 
            ? { ...msg, status: 'error' as const } 
            : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {freelancer.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              isConnecting ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold">{freelancer.username}</h3>
            <p className="text-sm text-gray-500">
              {isConnecting ? 'Connecting...' : 'Online'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-96 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId === senderId ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col space-y-1 max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.senderId === senderId
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`flex items-center space-x-2 text-xs ${
                  msg.senderId === senderId ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId === senderId && (
                    <span>
                      {msg.status === 'sending' && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {msg.status === 'error' && (
                        <span className="text-red-500">!</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Chat;