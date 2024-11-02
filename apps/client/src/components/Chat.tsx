// Chat.tsx

import React, { useEffect, useState, useRef } from "react";
import { User } from "../types/types";
import { Button } from "./shadcn/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { X, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getChatMessages, getActiveChats } from "../services/MindsMeshAPI";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

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
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderId = localStorage.getItem("userId");
  const [activeChats, setActiveChats] = useState<User[]>([]);
  const [selectedChatPartner, setSelectedChatPartner] = useState<User | null>(
    chatPartner && chatPartner.id !== senderId ? chatPartner : null
  );

  // Fetch active chats if no chatPartner is provided (i.e., when freelancer opens chat)
  useEffect(() => {
    const loadActiveChats = async () => {
      if (!chatPartner && senderId) {
        try {
          const chats = await getActiveChats();
          setActiveChats(chats);
          if (chats.length > 0) {
            setSelectedChatPartner(chats[0]); // Optionally select the first chat by default
          }
        } catch (error) {
          console.error("Error loading active chats:", error);
        }
      }
    };

    loadActiveChats();
  }, [chatPartner, senderId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when the component is first mounted or when selectedChatPartner changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (senderId && selectedChatPartner?.id) {
        try {
          const response = await getChatMessages(
            senderId,
            selectedChatPartner.id
          );
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

    loadChatHistory();
  }, [selectedChatPartner, senderId]);

  // Setup socket connection once when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && senderId) {
      const newSocket = io("http://localhost:3000", {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnecting(false);
        console.log("Connected to socket");
      });

      // Listen for the receiveMessage event
      newSocket.on("receiveMessage", (message: Message) => {
        // If the message is from or to the selected chat partner, add it to messages
        if (
          (message.senderId === selectedChatPartner?.id && message.receiverId === senderId) ||
          (message.senderId === senderId && message.receiverId === selectedChatPartner?.id)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              ...message,
              timestamp: new Date(message.timestamp),
              status: "sent",
            },
          ]);
        } else {
          // Optionally, update activeChats if a new message comes from a new employer
          if (!activeChats.some((user) => user.id === message.senderId)) {
            // Fetch the user data of the new sender and add to activeChats
            // You may need to implement getUserById in your API service
          }
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected. Attempting to reconnect...");
      });

      // Cleanup to avoid multiple socket connections
      return () => {
        newSocket.disconnect();
      };
    }
  }, [senderId, selectedChatPartner]);

  const handleSendMessage = async () => {
    if (!senderId || !newMessage.trim() || !selectedChatPartner) return;

    const messageObj: Message = {
      id: uuidv4(),
      senderId,
      receiverId: selectedChatPartner.id,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        {selectedChatPartner ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {selectedChatPartner.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* You can add online status indicator here if needed */}
              </div>
              <div>
                <h3 className="font-semibold">
                  {selectedChatPartner.username}
                </h3>
                {/* You can add more info here if needed */}
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
          </>
        ) : (
          <div className="flex-1 text-center">
            <h3 className="font-semibold">Select a Conversation</h3>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        {activeChats.length > 0 && !chatPartner && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Conversations</h4>
            <ul>
              {activeChats.map((chatUser) => (
                <li key={chatUser.id}>
                  <button
                    onClick={() => setSelectedChatPartner(chatUser)}
                    className={`text-left w-full py-2 px-4 rounded ${
                      selectedChatPartner?.id === chatUser.id
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    {chatUser.username}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="h-96 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === senderId ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col space-y-1 max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.senderId === senderId
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`flex items-center space-x-2 text-xs ${
                    msg.senderId === senderId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span className="text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId === senderId && (
                    <span>
                      {msg.status === "sending" && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {msg.status === "error" && (
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

      {selectedChatPartner && (
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
      )}
    </Card>
  );
};

export default Chat;
