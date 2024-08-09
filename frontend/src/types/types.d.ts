export type User = { 
    id: string;
    username: string;
    email: string;
    role: string;
    profile: UserProfile;
  }
  
  export type UserProfile= {
    bio: string;
    photo: string;
    skills: Skill[];
    reviews: Review[];
  }
  
  export type Skill = {
    id: string;
    title: string;
    description: string;
    price: number;
    availability: string;
    category: string;
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
  
