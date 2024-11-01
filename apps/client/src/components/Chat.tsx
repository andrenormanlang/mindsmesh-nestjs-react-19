import React, { useEffect, useState } from "react";
import { User } from "../types/types";
import { Button } from "./shadcn/ui/button";
import { sendMessage } from "../services/MindsMeshAPI"; // Import sendMessage from services
import { io, Socket } from "socket.io-client";

const Chat: React.FC<{ freelancer: User }> = ({ freelancer }) => {
  const [messages, setMessages] = useState<{ senderId: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const senderId = localStorage.getItem("userId");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && senderId) {
      const newSocket = io("http://localhost:3000/api", {
        auth: {
          token,
        },
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Successfully connected to the socket");
      });

      newSocket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [senderId]);

  const handleSendMessage = async () => {
    if (!senderId || !newMessage.trim()) return;

    const message = {
      senderId,
      receiverId: freelancer.id,
      text: newMessage,
    };

    try {
      await sendMessage(freelancer.id, newMessage); 

      if (socket) {
        socket.emit("sendMessage", message);
      }

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg">Chat with {freelancer.username}</h3>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={() => setSocket(null)} // Close button
          >
            &times;
          </button>
        </div>
        <div className="chat-window p-4 overflow-y-auto h-64 flex flex-col-reverse">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message flex ${msg.senderId === senderId ? "justify-end" : "justify-start"} mb-2`}
            >
              <div
                className={`message-bubble ${
                  msg.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                } p-3 rounded-lg shadow-sm max-w-xs`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input flex items-center p-2 border-t border-gray-200">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
          />
          <Button
            onClick={handleSendMessage}
            className="p-3 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
