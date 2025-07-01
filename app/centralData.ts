import { PostWithReplies } from './types';

// Centralized post data with unique, synchronized IDs
export const allPosts: PostWithReplies[] = [
  {
    post_id: 101,
    title: "Welcome to School Reddit!",
    author_id: "admin",
    upload_time: "2025-06-24T10:00:00Z",
    category: "General",
    content: `This is a platform for students to share questions, ideas, and discussions.\nFeel free to post anything related to school life, academics, or events.\nLet's build a helpful community together!`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 201,
        author_id: "alice",
        parent_post_id: 101,
        upload_time: "2025-06-24T11:00:00Z",
        content: "Great idea! Looking forward to using this.",
        anonymous: 0,
        validated: 1
      },
      {
        reply_id: 202,
        author_id: "bob456",
        parent_post_id: 101,
        upload_time: "2025-06-24T12:00:00Z",
        content: "Excited to see more posts!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 102,
    title: "AP Calculus AB - Derivatives Help",
    author_id: "johnsmith123",
    upload_time: "2025-06-23T14:30:00Z",
    category: "AP Calculus AB",
    content: `Can someone explain the chain rule for derivatives?\nI keep getting confused with composite functions.\nAny tips or practice problems?`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 203,
        author_id: "bob456",
        parent_post_id: 102,
        upload_time: "2025-06-23T15:45:00Z",
        content: "Try breaking it down step by step!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 103,
    title: "AP Physics C: Mechanics - Force Diagrams",
    author_id: "bob456",
    upload_time: "2025-06-22T09:15:00Z",
    category: "AP Physics C: Mechanics",
    content: `Stuck on Newton's laws problems with multiple objects.\nHow do you approach complex force diagrams?\nAny resources would be appreciated.`,
    anonymous: 0,
    validated: 1,
    replies: [],
  },
  {
    post_id: 104,
    title: "AP Biology Study Group",
    author_id: "carol789",
    upload_time: "2025-06-21T16:45:00Z",
    category: "AP Biology",
    content: `Anyone interested in forming a study group for the upcoming AP Biology exam?\nWe can meet after school or online.\nLet me know if you're interested!`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 204,
        author_id: "admin",
        parent_post_id: 104,
        upload_time: "2025-06-21T17:00:00Z",
        content: "Count me in!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 105,
    title: "AP English Literature - Essay Writing",
    author_id: "johnsmith123",
    upload_time: "2025-06-20T13:20:00Z",
    category: "AP English Literature",
    content: `Tips for writing strong thesis statements?\nStruggling with poetry analysis essays.\nHow do you structure your arguments?`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 205,
        author_id: "charlie789",
        parent_post_id: 105,
        upload_time: "2025-06-20T14:30:00Z",
        content: "Start with a clear claim about the text's meaning.",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 106,
    title: "Study Tips for Finals",
    author_id: "johnsmith123",
    upload_time: "2025-06-20T16:20:00Z",
    category: "General",
    content: `What are your best study tips for finals week?\nHow do you manage your time?`,
    anonymous: 0,
    validated: 1,
    replies: [],
  },
  {
    post_id: 107,
    title: "Chemistry Lab Safety Question",
    author_id: "johnsmith123",
    upload_time: "2025-06-18T09:45:00Z",
    category: "AP Chemistry",
    content: `Is it safe to mix these two chemicals?\nWhat precautions should I take?`,
    anonymous: 1, // This one is anonymous
    validated: 1,
    replies: [],
  },
];

// Helper function to get posts by author
export const getPostsByAuthor = (authorId: string): PostWithReplies[] => {
  return allPosts.filter(post => post.author_id === authorId);
};

// Helper function to get a single post by ID
export const getPostById = (postId: number): PostWithReplies | undefined => {
  return allPosts.find(post => post.post_id === postId);
};
