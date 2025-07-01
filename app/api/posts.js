import { apiRequest } from './config.js';

/**
 * Upload a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Upload response
 */
export async function postUpload(postData) {
  const {
    uploadTime,
    title,
    content,
    authorId,
    anonymous,
    category
  } = postData;

  return await apiRequest('/post-upload', {
    method: 'POST',
    body: JSON.stringify({
      upload_time: uploadTime,
      title: title,
      content: content,
      author_id: authorId,
      anonymous: anonymous,
      category: category
    })
  });
}

/**
 * Get all posts
 * @returns {Promise<Object>} Posts list response
 */
export async function getPostList() {
  return await apiRequest('/post-list', {
    method: 'GET'
  });
}

/**
 * Get posts by category
 * @param {string} category - Category name
 * @returns {Promise<Object>} Filtered posts response
 */
export async function getPostsByCategory(category) {
  return await apiRequest(`/post-by-category?category=${encodeURIComponent(category)}`, {
    method: 'GET'
  });
}

/**
 * Get user's own posts
 * @param {string} authorId - Author ID
 * @returns {Promise<Object>} User's posts response
 */
export async function getMyPosts(authorId) {
  return await apiRequest('/my-post-list', {
    method: 'POST',
    body: JSON.stringify({
      author_id: authorId
    })
  });
}

/**
 * Get a specific post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Post response
 */
export async function getPost(postId) {
  return await apiRequest(`/get-post?post_id=${postId}`, {
    method: 'GET'
  });
}
