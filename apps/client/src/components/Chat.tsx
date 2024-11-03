import React, { useEffect, useState, useRef } from "react";
import { User } from "../types/types";
import { Button } from "./shadcn/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { Send, Loader2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { getChatMessages, createRoom } from "../services/MindsMeshAPI";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { PaperClipIcon } from "@heroicons/react/20/solid";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

const formatTime = (date: Date) => {
  return format(new Date(date), "HH:mm");
};



const Chat: React.FC<{ chatPartner?: User | null; onClose?: () => void }> = ({
  chatPartner,

}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, _setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backendUrl_Employer = import.meta.env.VITE_BASE_URL_CHAT_EMPLOYER;
  const senderId = localStorage.getItem("userId");

  useEffect(() => {
    if (senderId && chatPartner) {
      const initializeChat = async () => {
        try {
          const currentUserRole = localStorage.getItem("userRole");
          if (currentUserRole === "employer") {
            // Only employers can create rooms
            await createRoom(chatPartner.id, `${senderId}-${chatPartner.id}`);
          }
          loadChatHistory();
        } catch (error) {
          console.error("Error initializing chat:", error);
        }
      };

      initializeChat();
    }
  }, [chatPartner, senderId]);

  const handleTyping = () => {
    if (socket && chatPartner) {
      socket.emit("typing", { receiverId: chatPartner.id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: chatPartner.id });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);


  const loadChatHistory = async () => {
    if (senderId && chatPartner?.id) {
      try {
        const response = await getChatMessages(senderId, chatPartner.id);
        setMessages(
          response.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender.id,
            receiverId: msg.receiver.id,
            text: msg.message,
            timestamp: new Date(msg.createdAt),
            status: "sent",
          }))
        );
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    } else {
      setMessages([]); // Clear messages if no chat partner is selected
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && senderId && chatPartner) {
      const newSocket = io(backendUrl_Employer, {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnecting(false);
        console.log("Connected to socket");
      });

      newSocket.on("disconnect", () => {
        setIsConnecting(true);
        console.log("Socket disconnected.");
      });

      newSocket.on("reconnect_attempt", () => {
        setIsConnecting(true);
        console.log("Attempting to reconnect...");
      });

      newSocket.on("receiveMessage", (message: Message) => {
        if (
          (message.senderId === chatPartner?.id && message.receiverId === senderId) ||
          (message.senderId === senderId && message.receiverId === chatPartner?.id)
        ) {
          setMessages((prev) => {
            const existingMessageIndex = prev.findIndex((msg) => msg.id === message.id);
            if (existingMessageIndex !== -1) {
              // Update the existing message
              const updatedMessages = [...prev];
              updatedMessages[existingMessageIndex] = {
                ...message,
                timestamp: new Date(message.timestamp),
                status: "sent",
              };
              return updatedMessages;
            } else {
              // Add new message
              return [
                ...prev,
                {
                  ...message,
                  timestamp: new Date(message.timestamp),
                  status: "sent",
                },
              ];
            }
          });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [senderId, chatPartner]);

  useEffect(() => {
    if (!isConnecting) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isConnecting]);

  const handleSendMessage = async () => {
    if (!senderId || !newMessage.trim() || !chatPartner) return;

    const messageObj: Message = {
      id: uuidv4(),
      senderId,
      receiverId: chatPartner.id,
      text: newMessage.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, messageObj]);
    setNewMessage("");

    try {
      if (socket) {
        socket.emit("sendMessage", messageObj);
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageObj.id ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageObj.id ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSendMessage();
  //   }
  // };

  const renderMessageContent = (text: string) => {
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-200 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderMessageStatus = (message: Message) => {
    switch (message.status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
      case "sent":
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
      case "error":
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return null;
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    return messages.reduce((groups: { [key: string]: Message[] }, message) => {
      const date = format(new Date(message.timestamp), 'MMM dd, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };


  return (
    <Card className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
    <CardHeader className="border-b bg-white p-4">
      {chatPartner ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {chatPartner.username.charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
                  isConnecting ? "bg-yellow-400" : "bg-green-500"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{chatPartner.username}</h3>
              {isTyping && (
                <p className="text-sm text-gray-500">typing...</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 text-center">
          <h3 className="font-semibold text-gray-900">Select a Conversation</h3>
        </div>
      )}
    </CardHeader>

    <CardContent className="p-0">
      <div className="h-[calc(100vh-16rem)] overflow-y-auto bg-gray-50">
        {isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Connecting to chat...</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm">
                    {date}
                  </span>
                </div>
                {dateMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === senderId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex flex-col space-y-1 max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          msg.senderId === senderId
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {renderMessageContent(msg.text)}
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          msg.senderId === senderId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.senderId === senderId && renderMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </CardContent>

    {chatPartner && (
      <CardFooter className="p-4 bg-white border-t">
        <div className="flex w-full items-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500 hover:text-gray-600"
          >
            <PaperClipIcon className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500"
              disabled={isConnecting}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isConnecting}
            size="icon"
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    )}
  </Card>
  );
};

export default Chat;
