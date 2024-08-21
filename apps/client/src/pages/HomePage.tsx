import { useEffect, useState } from "react";
import HipsterChubbyCat from "../assets/Hipster-Chubby-Cat.png";
import HipsterChubbyCat2 from "../assets/Hipster-Chubby-Cat-2.png";
import DefaultImage from "../assets/default-image.jpg";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../@/components/ui/card";
import { Input } from "../../@/components/ui/input";
import {
  deleteUser,
  fetchUsersWithSkills, // Fetches users either with all skills or filtered by a query
} from "../services/MindsMeshAPI";
import { User } from "../types/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import EditProfileForm from "../components/EditProfileForm";
import DeleteAccountModal from "../components/DeleteAccountConfirm";
import UserDetailCard from "../components/UserDetail";
import useDebounce from "../hooks/useDebounce";

const HomePage = () => {
  const [usersWithSkills, setUsersWithSkills] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isLargeScreen = window.innerWidth >= 1024;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultPhrase, setSearchResultPhrase] = useState<string | null>(null);


  const debouncedSearchQuery = useDebounce(searchQuery, 500);


  const loadUsersAndProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResultPhrase(null); // Reset the phrase on new search
    try {
      const users = await fetchUsersWithSkills(debouncedSearchQuery.toLowerCase());
  
      console.log("Fetched users from API:", users);
  
      const usersWithSkills = users.filter((user: User) => {
        console.log('User:', user);
        console.log('Skills:', user.skills);
        return user.skills && user.skills.length > 0;
      });
  
      if (!usersWithSkills.length) {
        setError("No users found with the given search query");
      } else {
        setUsersWithSkills(usersWithSkills);
        setSearchResultPhrase(`You found ${usersWithSkills.length} user${usersWithSkills.length > 1 ? 's' : ''} with the skill "${debouncedSearchQuery}".`);
      }
    } catch (error) {
      console.error("Failed to fetch users or profile", error);
      setError("Failed to fetch users or profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => {
    loadUsersAndProfile();
  }, [debouncedSearchQuery]);

  const handleDeleteAccount = async (userId: string) => {
    await deleteUser(userId);
    setCurrentUser(null);
    navigate("/");
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (user: User, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the event from bubbling up to the card
    setSelectedCardData(user);
    setIsViewModalOpen(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-green-900 text-white relative">
      {/* Image in the Top-Left Corner */}
      <img
        src={HipsterChubbyCat}
        alt="Hipster Chubby Cat"
        className="ml-4 absolute top-0 left-0 transform -rotate-180 w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48"
      />
      {/* Bottom Right Image */}
      <img
        src={HipsterChubbyCat2}
        alt="Hipster Chubby Cat 2"
        className="mr-4 absolute bottom-0 right-0 w-28 h-28 sm:w-48 sm:h-48 lg:w-64 lg:h-64"
      />

      <div className="flex flex-col items-center py-16 sm:py-24 relative z-10 w-full">
        <h1
          className={`text-lg sm:text-xl lg:text-4xl font-bold mb-6 sm:mb-4 text-right sm:text-center lg:text-center transition-colors duration-500 ${
            isLargeScreen ? "text-teal-400" : "text-red-500"
          }`}
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
      {searchResultPhrase && (
      <div className="flex justify-center items-center py-4">
        <p className="text-lg text-white">{searchResultPhrase}</p>
      </div>
    )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg text-white">Loading...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 sm:p-8">
          {usersWithSkills.map((user) => (
            <Card
              key={user.id}
              className="bg-white text-gray-900 p-4 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <CardHeader className="p-0 relative overflow-hidden h-56 flex items-center justify-center">
                {user.imageUrls && user.imageUrls.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Carousel className="relative">
                      <CarouselContent>
                        {user.imageUrls.map((url, index) => (
                          <CarouselItem key={index}>
                            <img
                              src={url}
                              alt={`${user.username}'s image ${index + 1}`}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
                      <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
                    </Carousel>
                  </div>
                ) : (
                  <img
                    src={DefaultImage}
                    alt="Placeholder"
                    className="w-full h-full object-contain rounded-lg"
                  />
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  {user.skills.map((skill) => (
                    <p
                      key={skill.id}
                      className="text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                      title={skill.title} // Full text will be shown on hover
                    >
                      {skill.title}
                    </p>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <button
                  onClick={(e) => openViewModal(user, e)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  View Details
                </button>
                {currentUser && currentUser.id === user.id && (
                  <div className="flex space-x-2">
                    <Pencil1Icon
                      className="w-5 h-5 text-gray-700 cursor-pointer hover:text-gray-900"
                      onClick={() => openEditModal(user)}
                    />
                    <TrashIcon
                      className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => openDeleteModal(user)}
                    />
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditProfileForm
              user={selectedUser}
              onClose={() => setIsEditModalOpen(false)}
              setUser={setCurrentUser} // Ensure this line is added
            />
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

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="w-full sm:max-w-[700px] p-4 m-0">
          {selectedCardData && <UserDetailCard user={selectedCardData} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
