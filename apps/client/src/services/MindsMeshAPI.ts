import axios from "axios";
import { User, Skill, Lesson, Review, UserAuth } from "../types/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adding JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication and User Management
export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", response.data.access_token);
  return await getProfile();
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("token");
};

export const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get("/auth/profile");
    const profile: UserAuth = response.data;
    return await getUserById(profile.sub);
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const fetchUsersWithSkills = async (query: string = ""): Promise<User[]> => {
  try {
    const endpoint = query.trim() ? "/skills/search" : "/users";
    const response = await api.get(endpoint, {
      params: query.trim() ? { q: query, t: Date.now() } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users with skills:", error);
    throw error;
  }
};

export const getAllSkillTitles = async (): Promise<{ title: string }[]> => {
  try {
    const response = await api.get("/skills/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all skills:", error);
    throw error;
  }
};

export const searchUsersBySkill = async (query: string): Promise<User[]> => {
  try {
    const response = await api.get(`/skills/search`, { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error("Error fetching users by skill:", error);
    throw error;
  }
};

export const getProfileWithFullUserData = async (): Promise<User> => {
  const profileResponse = await api.get("/auth/profile");
  const profile: UserAuth = profileResponse.data;
  const fullUserResponse = await api.get(`/users/${profile.sub}`);
  return fullUserResponse.data;
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  await api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  await api.post(`/auth/reset-password`, { token, newPassword });
};

export const register = async (
  username: string,
  password: string,
  email: string,
  imageUrls: File[] | null,
  skills: {
    title: string;
    description: string;
    price: number;
    isAvailable: boolean;
    id?: string;
  }[] = []
): Promise<User> => {
  const formData = new FormData();

  formData.append("username", username);
  formData.append("password", password); // Ensure password is appended correctly
  formData.append("email", email);

  if (imageUrls) {
    imageUrls.forEach((file) => {
      formData.append("imageUrls", file);
    });
  }

  if (skills && skills.length > 0) {
    skills.forEach((skill, index) => {
      formData.append(`skills[${index}][title]`, skill.title);
      formData.append(`skills[${index}][description]`, skill.description);
      formData.append(`skills[${index}][price]`, skill.price.toString());
      formData.append(`skills[${index}][isAvailable]`, skill.isAvailable.toString());
    });
  }

  try {
    const response = await api.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // localStorage.setItem("token", response.data.access_token);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};


export const updateProfile = async (
  profileData: Partial<User>
): Promise<User> => {
  const response = await api.put(`/users/${profileData.id}`, profileData);
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const updateUser = async (data: {
  id: string;
  username?: string;
  imageUrls?: string[];
  avatarFiles?: File[];
  skills?: Skill[];
}): Promise<User> => {
  const formData = new FormData();

  if (data.username) formData.append("username", data.username);

  if (data.imageUrls) {
    data.imageUrls.forEach((url) => {
      formData.append("imageUrls[]", url);
    });
  }

  if (data.avatarFiles) {
    data.avatarFiles.forEach((file) => {
      formData.append("avatarFiles", file);
    });
  }

  const response = await api.put(`/users/${data.id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const addSkillToUser = async (
  userId: string,
  skillData: Partial<Skill>
): Promise<Skill> => {
  try {
    const response = await api.post(`/users/${userId}/skills`, skillData);
    return response.data;
  } catch (error) {
    console.error("Error adding skill to user:", error);
    throw error;
  }
};

export const updateUserSkill = async (
  userId: string,
  skillId: string,
  skillData: Partial<Skill>
): Promise<Skill> => {
  const response = await api.put(`/users/${userId}/skills/${skillId}`, skillData);
  return response.data;
};

export const deleteUserSkill = async (
  userId: string,
  skillId: string
): Promise<void> => {
  await api.delete(`/users/${userId}/skills/${skillId}`);
};

// Skill Management
export const createSkill = async (skillData: Partial<Skill>): Promise<Skill> => {
  const response = await api.post("/skills", skillData);
  return response.data;
};

export const getAllSkills = async (): Promise<Skill[]> => {
  const response = await api.get("/skills");
  return response.data;
};

export const getSkillById = async (skillId: string): Promise<Skill> => {
  const response = await api.get(`/skills/${skillId}`);
  return response.data;
};

export const updateSkill = async (
  skillId: string,
  skillData: Partial<Skill>
): Promise<Skill> => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

export const deleteSkill = async (skillId: string): Promise<void> => {
  await api.delete(`/skills/${skillId}`);
};

// Booking Management
export const bookLesson = async (lessonData: Partial<Lesson>): Promise<Lesson> => {
  const response = await api.post("/lessons", lessonData);
  return response.data;
};

export const getAllBookings = async (): Promise<Lesson[]> => {
  const response = await api.get("/bookings");
  return response.data;
};

export const getBookingById = async (bookingId: string): Promise<Lesson> => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

// Review Management
export const leaveReview = async (reviewData: Partial<Review>): Promise<Review> => {
  const response = await api.post("/reviews", reviewData);
  return response.data;
};

export const getReviewsForSkill = async (skillId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/skill/${skillId}`);
  return response.data;
};

export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

// Admin Management
export const manageUserRoles = async (
  userId: string,
  role: string
): Promise<void> => {
  await api.put(`/admin/users/${userId}/role`, { role });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post("/auth/forgot-password", { email });
};
