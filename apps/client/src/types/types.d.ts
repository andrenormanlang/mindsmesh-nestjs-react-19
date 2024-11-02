export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  profile: UserProfile;
  skills: Skill[];
  imageUrls?: string[];
  isOnline?: boolean; 
};

export type UserAuth = {
  emai: string;
  sub: string;
  iat: number;
  exp: number;
  sub: string;
};

export type Skill = {
  id?: string;
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
  // category: string;
};

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  avatar?: FileList;
};

export type SkillData = {
  id?: string;
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
};

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface Room {
  id: string;
  roomName: string;
  employerName: string; 
}


// export type Message = {
//   senderId: string;
//   receiverId: string;
//   text: string;
// };

