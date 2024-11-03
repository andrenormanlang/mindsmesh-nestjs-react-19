import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./shadcn/ui/dialog";
import { fetchRoomsForFreelancer } from "../services/MindsMeshAPI";
import { Room, User } from "../types/types";
import { io } from "socket.io-client";
import Chat from "./Chat";
import { Button } from "./shadcn/ui/button";
import { Loader2, Users, MessageSquare, ArrowLeft, X } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      if (isOpen && freelancerId) {
        setIsLoading(true);
        try {
          const roomsData = await fetchRoomsForFreelancer(freelancerId);
          const processedRooms = roomsData.map((room) => ({
            ...room,
            employerName: room.employer?.username || "Unknown Employer",
          }));
          setRooms(processedRooms);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadRooms();
  }, [isOpen, freelancerId]);

  const handleJoinRoom = (room: Room) => {
    if (socket && room.id) {
      socket.emit("joinRoom", { roomId: room.id });
      setActiveChatPartner(room.employer);
      setIsChatOpen(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[480px] p-0 gap-0 bg-gray-50">
        {isChatOpen && activeChatPartner ? (
          <>
            <div className="sticky top-0 z-10 bg-white border-b">
              <div className="flex justify-between items-center px-4 py-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-gray-100 space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Rooms</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-w-[480px] mx-auto">
              <Chat
                chatPartner={activeChatPartner}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 py-4 border-b bg-white">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <DialogTitle>Available Rooms</DialogTitle>
              </div>
            </DialogHeader>
            <div className="p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-500">Loading rooms...</p>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid gap-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-colors"
                    >
                      <button
                        onClick={() => handleJoinRoom(room)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                              {room.employerName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {room.employerName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {room.roomName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-blue-600">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Users className="h-12 w-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-gray-500 font-medium">No rooms available</p>
                    <p className="text-sm text-gray-400">
                      Check back later for new conversations
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Rooms;