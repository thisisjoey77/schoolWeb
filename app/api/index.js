// Main API exports for easy importing
export * from './auth.js';
export * from './posts.js';
export * from './replies.js';
export { apiRequest } from './config.js';

// Example usage:
/*
import { loginCheckStudent, postUpload, getPostList } from './api/index.js';

// Login a student
const loginResult = await loginCheckStudent('student123', 'password');

// Create a new post
const newPost = await postUpload({
  uploadTime: new Date().toISOString(),
  title: 'My Post',
  content: 'This is my post content',
  authorId: 'student123',
  anonymous: 0,
  category: 'General'
});

// Get all posts
const posts = await getPostList();
*/
