import { CurrentUser } from './types';
import { getPostsByAuthor } from './centralData';

// Central user data for profile and posts (matching database schema)
export const currentUser: CurrentUser = {
  user_id: "johnsmith123",
  password: "hashed_password_here", // In real app, this would be hashed
  given_name: "John",
  surname: "Smith",
  age: 17,
  intended_major: "Computer Science",
  email: "john.smith@school.edu",
  class: 2025, // Class of 2025
  school_id: 12345,
  point: 150, // From student_data table
  student_validated: 1, // From student_data table
};

// Get user's posts from centralized data
export const userPosts = getPostsByAuthor(currentUser.user_id);
