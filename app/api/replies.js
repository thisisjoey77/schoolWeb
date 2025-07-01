import { apiRequest } from './config.js';

/**
 * Get replies for a specific post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Replies response
 */
export async function getPostReplies(postId) {
  return await apiRequest(`/get-post-replies?post_id=${postId}`, {
    method: 'GET'
  });
}

/**
 * Post a reply to a post
 * @param {Object} replyData - Reply data
 * @returns {Promise<Object>} Reply response
 */
export async function postReply(replyData) {
  const {
    uploadTime,
    parentPostId,
    content,
    authorId,
    anonymous
  } = replyData;

  return await apiRequest('/post-reply', {
    method: 'POST',
    body: JSON.stringify({
      upload_time: uploadTime,
      parent_post_id: parentPostId,
      content: content,
      author_id: authorId,
      anonymous: anonymous
    })
  });
}
