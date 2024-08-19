export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  profile: UserProfile;
  skills: Skill[];
  avatarUrls?: string[]; // Array of avatar URLs
};

export type UserAuth = {
  emai: string;
  sub: string;
  iat: number;
  exp: number;
  sub: string;
  }  
  
  
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
  }
  
  export type SkillData = {
    id?: string;
    title: string;
    description: string;
    price: number;
    isAvailable: boolean;
  }
  
  
  export type Lesson = {
    id: string;
    skillId: string;
    userId: string;
    date: string;
    status: string;
  }
  
  export type Review = {
    id: string;
    skillId: string;
    userId: string;
    rating: number;
    comment: string;
  }
  
  export type RoleUpdate = {
    role: string;
  }
  
  export type Listing = {
    id: string;
    title: string;
    description: string;
    price: number;
  }
  