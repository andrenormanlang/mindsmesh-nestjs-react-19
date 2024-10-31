import React, { useEffect, useState } from "react";
import { User } from "../types/types";
import { Button } from "./shadcn/ui/button";
import axios from "axios";
import { io, Socket } from "socket.io-client"; // Import io from socket.io-client

const ChatComponent: React.FC<{ freelancer: User }> = ({ freelancer }) => {
  const [messages, setMessages] = useState<{ senderId: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const senderId = localStorage.getItem("userId");

  // Define the socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Initializing ChatComponent with senderId:", senderId);
    console.log("Initializing ChatComponent with token:", token);

    if (token && senderId) {
      // Initialize socket connection
      const newSocket = io("http://localhost:3000/api", {
        auth: {
          token, // Use the token for authentication
        },
      });

      // Save socket instance to state
      setSocket(newSocket);
      console.log("Socket initialized with token:", token);

      // Socket event handlers
      newSocket.on("connect", () => {
        console.log("Successfully connected to the socket with senderId:", senderId);
      });

      newSocket.on("receiveMessage", (message) => {
        console.log("Message received via WebSocket:", message);
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        console.log("Disconnecting socket");
        newSocket.disconnect(); // Clean up on component unmount
      };
    } else {
      console.warn("Token or senderId is missing, cannot initialize socket");
    }
  }, [senderId]);

  const handleSendMessage = async () => {
    console.log("Send button clicked");
  
    if (!senderId || !newMessage.trim()) {
      console.log("Missing senderId or empty message. senderId:", senderId, " newMessage:", newMessage);
      return;
    }
  
    const message = {
      senderId,
      receiverId: freelancer.id,
      text: newMessage,
    };
  
    console.log("Preparing to send message:", message);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
  
      console.log("Sending message via REST API, token:", token);
  
      const response = await axios.post(
        `http://localhost:3000/api/chat/${freelancer.id}/send`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );
  
      console.log("Message successfully sent via REST API:", response.data);
  
      // Emit a WebSocket message for real-time notification if socket is connected
      if (socket) {
        console.log("Emitting message via WebSocket:", message);
        socket.emit("sendMessage", message); // Using the socket instance from state
      } else {
        console.error("Socket is not connected, cannot emit message");
      }
  
      // Update message list in UI
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  return (
    <div className="chat-component">
      <div className="chat-window p-4 border border-gray-300 rounded-md">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.senderId === senderId ? "sent" : "received"}`}
          >
            <span
              className={`message-bubble ${
                msg.senderId === senderId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
              } p-2 rounded-md`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="chat-input flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l-md"
          placeholder="Type your message here..."
        />
        <Button
          onClick={handleSendMessage}
          className="rounded-r-md bg-blue-600 text-white"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
