import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./shadcn/ui/dialog";
import { fetchRoomsForFreelancer } from "../services/MindsMeshAPI";
import { Room, User } from "../types/types";
import { io } from "socket.io-client";
import Chat from "./Chat"; // Import the Chat component

const socket = io(import.meta.env.VITE_BASE_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

interface RoomsProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
}

const Rooms: React.FC<RoomsProps> = ({ isOpen, onClose, freelancerId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      if (isOpen && freelancerId) {
        try {
          const roomsData = await fetchRoomsForFreelancer(freelancerId);
          // After fetching rooms, map the employerName property properly
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
    if (socket && room.id) {
      socket.emit("joinRoom", { roomId: room.id });
      console.log(`Joining room with ID: ${room.id}`); // Add logging to confirm the event is emitted

      // Set the active chat partner and room
      setActiveChatPartner(room.employer);
      setIsChatOpen(true);
    } else {
      console.error("Socket not initialized or room ID missing");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[500px] p-4">
        {isChatOpen && activeChatPartner ? (
          <Chat
            chatPartner={activeChatPartner}
            onClose={() => setIsChatOpen(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Select a Room</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              {rooms.length > 0 && (
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
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Rooms;

