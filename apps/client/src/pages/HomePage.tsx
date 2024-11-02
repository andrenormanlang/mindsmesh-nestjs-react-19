import { useEffect, useState, useCallback, useMemo, use } from "react";
import { useNavigate } from "react-router-dom";
import { GradientContext } from "../contexts/GradientContext";
import { UserContext } from "../contexts/UserContext";
import HipsterChubbyCat from "../assets/Hipster-Chubby-Cat.webp";
import HipsterChubbyCat2 from "../assets/Hipster-Chubby-Cat-2.webp";
import { Input } from "../components/shadcn/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/shadcn/ui/dialog";
import { deleteUser, fetchUsersByRole, fetchUsersWithSkills } from "../services/MindsMeshAPI";
import { User } from "../types/types";
import UserCard from "../components/UserCard";
import EditProfileForm from "../components/EditProfileForm";
import DeleteAccountModal from "../components/DeleteAccountConfirm";
import UserDetailCard from "../components/UserDetail";
import useDebounce from "../hooks/useDebounce";
import LoadingSpinner from "../helpers/LoadingSpinner";
import Chat from "../components/Chat";

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
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const userContext = use(UserContext);
  const gradientContext = use(GradientContext);

  if (!userContext || !gradientContext) {
    throw new Error(
      "UserContext and GradientContext must be used within their respective providers"
    );
  }

  const { user, refreshUser, setUser } = userContext;

useEffect(() => {
  const loadUsersAndProfile = async () => {
    setIsLoading(true);
    setSearchResultPhrase(null);
    try {
      await refreshUser();

      let users: User[] = [];
      if (userContext?.user?.role === 'employer') {
        // Employers fetch freelancers with skills
        users = await fetchUsersWithSkills(debouncedSearchQuery.toLowerCase());
      } else if (userContext?.user?.role === 'freelancer') {
        // Freelancers don't see other users
        users = [];
      } else {
        // User is not logged in, fetch freelancers with skills
        users = await fetchUsersWithSkills(debouncedSearchQuery.toLowerCase());
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
}, [debouncedSearchQuery, refreshUser, userContext?.user?.role]);



  // useEffect(() => {
  //   loadUsersAndProfile();
  // }, [loadUsersAndProfile]);

  const handleDeleteAccount = useCallback(
    async (userId: string) => {
      await deleteUser(userId);
      setSelectedUser(null);
      navigate("/");
    },
    [navigate]
  );

  const openEditModal = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  const openViewModal = useCallback((user: User, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedUser(user);
    setIsViewModalOpen(true);
  }, []);

  const openChatModal = useCallback((user: User, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedUser(user);
    setIsChatModalOpen(true);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

 
  // In HomePage.tsx
const memoizedUserCards = useMemo(
  () =>
    usersWithSkills.map((user) => {
      let showChatButton = false;

      if (userContext?.user) {
        if (
          (userContext.user.role === "freelancer" && user.role === "employer") ||
          (userContext.user.role === "employer" && user.role === "freelancer")
        ) {
          // Show chat button if the roles are complementary
          showChatButton = true;
        }
      }

      return (
        <UserCard
          key={user.id}
          user={user}
          onViewDetails={openViewModal}
          onEdit={
            userContext?.user?.id === user.id ? openEditModal : undefined
          }
          onDelete={
            userContext?.user?.id === user.id ? openDeleteModal : undefined
          }
          onChat={showChatButton ? openChatModal : undefined}
        />
      );
    }),
  [
    usersWithSkills,
    openViewModal,
    openEditModal,
    openDeleteModal,
    openChatModal,
    userContext?.user,
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
          {selectedUser && <Chat chatPartner={selectedUser} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;