import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./shadcn/ui/dialog";
import { fetchRoomsForFreelancer } from "../services/MindsMeshAPI";
import { Room, User } from "../types/types";
import { io, Socket } from "socket.io-client";
import Chat from "./Chat"; // Import the Chat component

interface RoomsProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
}

const Rooms: React.FC<RoomsProps> = ({ isOpen, onClose, freelancerId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_BASE_URL, {
        auth: { token },
        reconnectionAttempts: 5, // Limit the number of reconnection attempts
        reconnectionDelay: 1000, // 1-second delay between attempts
      });

      setSocket(newSocket);

      // Socket event listeners
      newSocket.on("connect", () => {
        console.log("Connected to socket");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected. Reason:", reason);
        if (reason === "io server disconnect") {
          newSocket.connect(); // Manually reconnect if the server disconnected the socket
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      if (isOpen && freelancerId) {
        try {
          const roomsData = await fetchRoomsForFreelancer(freelancerId);
          const processedRooms = roomsData.map((room) => ({
            ...room,
            employerName: room.employer?.username || "Unknown Employer",
          }));
          setRooms(processedRooms);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };
    loadRooms();
  }, [isOpen, freelancerId]);

  const handleJoinRoom = (room: Room) => {
    if (socket && socket.connected && room.id) {
      socket.emit("joinRoom", { roomId: room.id });
      console.log(`Joining room with ID: ${room.id}`);

      setActiveChatPartner(room.employer);
      setIsChatOpen(true);
      onClose(); // Close the room modal before opening the chat
    } else {
      console.error("Socket not initialized, not connected, or room ID missing");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full sm:max-w-[500px] p-4">
          <DialogHeader>
            <DialogTitle>Select a Room</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            {rooms.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Employer</th>
                    <th className="py-2">Room Name</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td className="py-2">{room.employerName}</td>
                      <td className="py-2">{room.roomName}</td>
                      <td className="py-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                          onClick={() => handleJoinRoom(room)}
                        >
                          Join
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center">No available rooms</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      {isChatOpen && activeChatPartner && (
        <Chat
          chatPartner={activeChatPartner}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

export default Rooms;
