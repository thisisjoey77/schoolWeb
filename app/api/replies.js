import { apiRequest } from './config.js';

/**
 * Get replies for a specific post
 * @param {number} postId - Post ID
 * @param {string} requesterSchoolId - Optional: Requester's school ID (for teacher view)
 * @returns {Promise<Object>} Replies response
 */
export async function getPostReplies(postId, requesterSchoolId = null) {
  const url = requesterSchoolId 
    ? `/get-post-replies?post_id=${postId}&requester_school_id=${encodeURIComponent(requesterSchoolId)}`
    : `/get-post-replies?post_id=${postId}`;
  
  return await apiRequest(url, {
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

/**
 * Block a reply (set validated=0)
 */
export async function blockReply(replyId, requesterSchoolId) {
  return await apiRequest('/block-reply', {
    method: 'POST',
    body: JSON.stringify({
      reply_id: replyId,
      requester_school_id: requesterSchoolId
    })
  });
}

/**
 * Validate a reply (set validated=1)
 */
export async function validateReply(replyId, requesterSchoolId) {
  return await apiRequest('/validate-reply', {
    method: 'POST',
    body: JSON.stringify({
      reply_id: replyId,
      requester_school_id: requesterSchoolId
    })
  });
}
