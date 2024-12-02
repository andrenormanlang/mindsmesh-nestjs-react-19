// src/pages/HomePage.tsx

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { GradientContext } from "../contexts/GradientContext";
import { UserContext } from "../contexts/UserContext";
import { SocketContext } from "../contexts/SocketContext";
import HipsterChubbyCat from "../assets/Hipster-Chubby-Cat.webp";
import HipsterChubbyCat2 from "../assets/Hipster-Chubby-Cat-2.webp";
import { Input } from "../components/shadcn/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/shadcn/ui/dialog";
import {
  deleteUser,
  fetchUsersWithSkills,
  getUnreadCounts,
} from "../services/MindsMeshAPI";
import { User } from "../types/types";
import UserCard from "../components/UserCard";
import EditProfileForm from "../components/EditProfileForm";
import DeleteAccountModal from "../components/DeleteAccountConfirm";
import UserDetailCard from "../components/UserDetail";
import useDebounce from "../hooks/useDebounce";
import LoadingSpinner from "../helpers/LoadingSpinner";
import Chat from "../components/Chat";
import Rooms from "../components/Rooms";

const HomePage = () => {
  const [usersWithSkills, setUsersWithSkills] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultPhrase, setSearchResultPhrase] = useState<string | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>(
    {}
  );

  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const userContext = useContext(UserContext);
  const gradientContext = useContext(GradientContext);
  const { socket } = useContext(SocketContext);

  if (!userContext || !gradientContext) {
    throw new Error(
      "UserContext and GradientContext must be used within their respective providers"
    );
  }

  const { refreshUser, setUser } = userContext;

  // Memoize refreshUser to prevent it from changing on every render
  const memoizedRefreshUser = useCallback(refreshUser, []);

  // Fetch Users and Profiles
  useEffect(() => {
    const loadUsersAndProfile = async () => {
      setIsLoading(true);
      setSearchResultPhrase(null);
      try {
        await memoizedRefreshUser();

        let users: User[] = [];
        if (userContext?.user?.role === "employer") {
          // Employers fetch freelancers with skills
          users = await fetchUsersWithSkills(
            debouncedSearchQuery.toLowerCase(),
            "freelancer"
          );
        } else if (userContext?.user?.role === "freelancer") {
          // Freelancers see only their own profile
          users = [userContext.user];
        } else {
          // Unauthenticated users fetch freelancers with skills
          users = await fetchUsersWithSkills(
            debouncedSearchQuery.toLowerCase(),
            "freelancer"
          );
        }

        setUsersWithSkills(users);
        setSearchResultPhrase(`You found ${users.length} user(s).`);
      } catch (error) {
        console.error("Failed to fetch users or profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsersAndProfile();
  }, [debouncedSearchQuery, memoizedRefreshUser, userContext?.user?.role]);

  // Fetch unread counts on component mount and periodically
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const counts = await getUnreadCounts();
        console.log("Fetched unread counts:", counts);
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Failed to fetch unread counts", error);
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs once on mount

  // Handle WebSocket events for real-time updates
  useEffect(() => {
    if (socket && userContext.user?.id) {
      const currentUserId = userContext.user.id;

      const handleReceiveMessage = (message: any) => {
        console.log("Received message:", message);
        if (message.receiverId === currentUserId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.senderId]: (prev[message.senderId] || 0) + 1,
          }));
        }
      };

      const handleMessagesRead = (data: { senderId: string; receiverId: string }) => {
        console.log("Messages read:", data);
        setUnreadCounts((prev) => ({
          ...prev,
          [data.senderId]: 0,
        }));
      };

      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("messagesRead", handleMessagesRead);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("messagesRead", handleMessagesRead);
      };
    }
  }, [socket, userContext.user?.id]);

  const handleDeleteAccount = useCallback(
    async (userId: string) => {
      await deleteUser(userId);
      setSelectedUser(null);
      navigate("/");
    },
    [navigate]
  );

  // Function to close all modals
  const closeAllModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setIsChatModalOpen(false);
    setIsRoomsModalOpen(false);
  };

  const openEditModal = useCallback((user: User) => {
    closeAllModals();
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((user: User) => {
    closeAllModals();
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  const openViewModal = useCallback(
    (user: User, event: React.MouseEvent) => {
      event.stopPropagation();
      closeAllModals();
      setSelectedUser(user);
      setIsViewModalOpen(true);
    },
    []
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  const openChatOrRoomsModal = useCallback(
    (user: User, event: React.MouseEvent) => {
      event.stopPropagation();
      closeAllModals();

      if (
        userContext?.user?.role === "freelancer" &&
        userContext.user.id === user.id
      ) {
        // Freelancer clicks on their own card to see rooms
        setSelectedUser(user);
        setIsRoomsModalOpen(true);
      } else {
        // Employer clicks to chat with a freelancer
        setSelectedUser(user);
        setIsChatModalOpen(true);
      }
    },
    [userContext?.user]
  );

  const memoizedUserCards = useMemo(
    () =>
      usersWithSkills
        .filter((user) => user.role !== "employer") // Exclude employers
        .map((user) => (
          <UserCard
            key={user.id}
            user={user}
            unreadCount={unreadCounts[user.id] || 0} // Pass unreadCount for individual users
            unreadCounts={unreadCounts} // Pass the entire unreadCounts object
            onViewDetails={openViewModal}
            onEdit={
              userContext?.user?.id === user.id ? openEditModal : undefined
            }
            onDelete={
              userContext?.user?.id === user.id ? openDeleteModal : undefined
            }
            onChat={openChatOrRoomsModal}
          />
        )),
    [
      usersWithSkills,
      openViewModal,
      openEditModal,
      openDeleteModal,
      openChatOrRoomsModal,
      userContext?.user,
      unreadCounts,
    ]
  );

  return (
    <div className="min-h-screen text-white relative">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <img
            src={HipsterChubbyCat}
            alt="Hipster Chubby Cat"
            className="ml-4 absolute top-0 left-0 transform -rotate-180 w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48 hover-slide-fade-left"
          />
          <img
            src={HipsterChubbyCat2}
            alt="Hipster Chubby Cat 2"
            className="mr-4 absolute bottom-0 right-0 w-28 h-28 sm:w-48 sm:h-48 lg:w-64 lg:h-64 hover-slide-fade-right"
          />
          <div className="flex flex-col items-center py-16 sm:py-24 relative z-10 w-full">
            <h1
              className="text-lg sm:text-xl lg:text-4xl font-bold mb-6 sm:mb-4 text-right sm:text-center lg:text-center text-white transition-colors duration-500"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
            >
              Find the right pro, right away
            </h1>
            <Input
              type="text"
              placeholder="Search for any service..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-11/12 sm:w-1/2 p-4 text-lg rounded-full mb-2 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-lg placeholder-gray-400"
            />
          </div>
          {debouncedSearchQuery && searchResultPhrase && (
            <div className="flex justify-center items-center py-4">
              <p className="text-lg text-white">{searchResultPhrase}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 sm:p-8">
            {memoizedUserCards}
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditProfileForm user={selectedUser} setUser={setUser} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        {selectedUser && (
          <DeleteAccountModal
            userEmail={selectedUser.email}
            onDeleteConfirm={() => handleDeleteAccount(selectedUser.id)}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          />
        )}
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="w-full sm:max-w-[700px] p-4 m-0">
          {selectedUser && <UserDetailCard user={selectedUser} />}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="w-full sm:max-w-[400px] p-0 m-0">
          {isChatModalOpen && selectedUser && (
            <Chat
              chatPartner={selectedUser}
              onClose={() => setIsChatModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rooms Modal */}
      <Dialog open={isRoomsModalOpen} onOpenChange={setIsRoomsModalOpen}>
        <DialogContent className="w-full sm:max-w-[500px] p-4">
          {userContext.user && (
            <Rooms
              isOpen={isRoomsModalOpen}
              freelancerId={userContext.user.id}
              onClose={() => setIsRoomsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
