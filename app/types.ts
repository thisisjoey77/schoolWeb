// Database type definitions to match the schema

export interface Post {
  post_id: number;
  upload_time: string; // datetime as string (ISO format)
  content: string; // longtext
  author_id: string; // varchar(100)
  anonymous: number; // tinyint(1) - 0 or 1
  image?: string; // longtext - optional for now
  category: string; // varchar(100)
  reply?: string; // longtext - for backwards compatibility, but we'll use Reply[] instead
  title: string; // varchar(100)
  validated: number; // tinyint(1) - 0 or 1
}

export interface Reply {
  reply_id: number;
  author_id: string; // varchar(100)
  upload_time: string; // datetime as string (ISO format)
  anonymous: number; // tinyint(1) - 0 or 1
  image?: string; // longtext - optional for now
  parent_post_id: number; // integer
  content: string; // longtext
  validated: number; // tinyint(1) - 0 or 1
}

export interface PersonalInfo {
  user_id: string; // varchar(100)
  password: string; // varchar(100)
  given_name: string; // varchar(100)
  surname: string; // varchar(100)
  age: number; // unsigned int
  intended_major: string; // varchar(100)
  email: string; // varchar(100)
  class: number; // unsigned int (class of 2026, etc.)
  school_id: number; // integer
}

export interface StudentData {
  school_id: number; // integer
  user_id: string; // varchar(100)
  password: string; // varchar(100)
  point: number; // unsigned int
  validated: number; // tinyint(1) - 0 or 1
}

// Helper type for posts with their replies (for UI purposes)
export interface PostWithReplies extends Post {
  replies: Reply[];
}

// Current user type combining personal and student data
export interface CurrentUser extends PersonalInfo {
  point: number;
  student_validated: number;
}
