import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./shadcn/ui/dialog";
import { fetchRoomsForFreelancer } from "../services/MindsMeshAPI"; // Create an API function to fetch rooms
import { Room } from "../types/types";

interface RoomsProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
}

const Rooms: React.FC<RoomsProps> = ({ isOpen, onClose, freelancerId }) => {
    const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      if (isOpen && freelancerId) {
        const roomsData = await fetchRoomsForFreelancer(freelancerId);
        setRooms(roomsData);
      }
    };

    loadRooms();
  }, [isOpen, freelancerId]);

  return (
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
                        onClick={() => {
                          // Logic to enter the room and start chatting
                        }}
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
  );
};

export default Rooms;
