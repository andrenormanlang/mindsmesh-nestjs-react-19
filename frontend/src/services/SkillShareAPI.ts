import axios from 'axios';
import { User, Skill, Lesson, Review } from '../types/types';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Your backend URL
});

// Authentication and User Management

export const login = async (username: string, password: string): Promise<User> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const register = async (username: string, password: string, email: string): Promise<User> => {
  const response = await api.post('/auth/register', { username, password, email });
  return response.data;
};

export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Skill Management

export const createSkill = async (skillData: Partial<Skill>): Promise<Skill> => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const getAllSkills = async (): Promise<Skill[]> => {
  const response = await api.get('/skills');
  return response.data;
};

export const getSkillById = async (skillId: string): Promise<Skill> => {
  const response = await api.get(`/skills/${skillId}`);
  return response.data;
};

export const updateSkill = async (skillId: string, skillData: Partial<Skill>): Promise<Skill> => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

export const deleteSkill = async (skillId: string): Promise<void> => {
  const response = await api.delete(`/skills/${skillId}`);
  return response.data;
};

// Booking Management

export const bookLesson = async (lessonData: Partial<Lesson>): Promise<Lesson> => {
  const response = await api.post('/lessons', lessonData);
  return response.data;
};

export const getAllBookings = async (): Promise<Lesson[]> => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBookingById = async (bookingId: string): Promise<Lesson> => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

// Review Management

export const leaveReview = async (reviewData: Partial<Review>): Promise<Review> => {
  const response = await api.post('/reviews', reviewData);
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

export const manageUserRoles = async (userId: string, role: string): Promise<void> => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};