import { PostWithReplies } from './types';

// Centralized post data with unique, synchronized IDs
export const allPosts: PostWithReplies[] = [];

// Helper function to get posts by author
export const getPostsByAuthor = (authorId: string): PostWithReplies[] => {
  return allPosts.filter(post => post.author_id === authorId);
};

// Helper function to get a single post by ID
export const getPostById = (postId: number): PostWithReplies | undefined => {
  return allPosts.find(post => post.post_id === postId);
};
