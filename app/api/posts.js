import { apiRequest } from './config.js';

/**
 * Get all posts
 * @param {string} requesterSchoolId - Optional: Requester's school ID (for teacher view)
 * @param {boolean} showPending - Optional: For teachers, whether to show pending (unvalidated) posts
 * @returns {Promise<Object>} All posts response
 */
export async function getPostList(requesterSchoolId = null, showPending = false) {
  let url = requesterSchoolId 
    ? `/post-list?requester_school_id=${encodeURIComponent(requesterSchoolId)}`
    : '/post-list';
  
  if (requesterSchoolId && typeof showPending === 'boolean') {
    url += `&show_pending=${showPending ? 'true' : 'false'}`;
  }
  
  return await apiRequest(url, {
    method: 'GET'
  });
}

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
 * Get posts by category
 * @param {string} category - Category name
 * @param {string} requesterSchoolId - Optional: Requester's school ID (for teacher view)
 * @param {boolean} showPending - Optional: For teachers, whether to show pending (unvalidated) posts
 * @returns {Promise<Object>} Filtered posts response
 */
export async function getPostsByCategory(category, requesterSchoolId = null, showPending = false) {
  let url = `/post-by-category?category=${encodeURIComponent(category)}`;
  if (requesterSchoolId) {
    url += `&requester_school_id=${encodeURIComponent(requesterSchoolId)}`;
  }
  if (requesterSchoolId && typeof showPending === 'boolean') {
    url += `&show_pending=${showPending ? 'true' : 'false'}`;
  }
  return await apiRequest(url, {
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
 * @param {string} requesterSchoolId - Optional: Requester's school ID (for teacher view)
 * @returns {Promise<Object>} Post response
 */
export async function getPost(postId, requesterSchoolId = null) {
  let url = `/get-post?post_id=${postId}`;
  if (requesterSchoolId) {
    url += `&requester_school_id=${encodeURIComponent(requesterSchoolId)}`;
  }
  
  return await apiRequest(url, {
    method: 'GET'
  });
}

/**
 * Get classes for a teacher
 * @param {string} schoolId - Teacher's school ID
 * @returns {Promise<Object>} Classes response
 */
export async function getClasses(schoolId) {
  return await apiRequest(`/get-classes?school_id=${schoolId}`, {
    method: 'GET'
  });
}

/**
 * Get student information by school ID
 * @param {string} schoolId - Student's school ID
 * @returns {Promise<Object>} Student info response
 */
export async function getStudentInfo(schoolId, requesterSchoolId = null) {
  const q = requesterSchoolId ? `&requester_school_id=${encodeURIComponent(requesterSchoolId)}` : '';
  return await apiRequest(`/get-student-info?school_id=${schoolId}${q}`, {
    method: 'GET'
  });
}

/**
 * Get student post count by author ID
 * @param {string} authorId - Student's author ID
 * @returns {Promise<Object>} Post count response
 */
export async function getStudentPostCount(authorId) {
  return await apiRequest(`/get-student-post-count?author_id=${authorId}`, {
    method: 'GET'
  });
}

/**
 * Search for students by name
 * @param {string} name - Student name to search for
 * @returns {Promise<Object>} Search results response
 */
export async function searchStudents(name, requesterSchoolId = null) {
  const q = requesterSchoolId ? `&requester_school_id=${encodeURIComponent(requesterSchoolId)}` : '';
  return await apiRequest(`/search-students?name=${encodeURIComponent(name)}${q}`, {
    method: 'GET'
  });
}

/**
 * Add a student to a class
 * @param {number} classId - Class ID
 * @param {string} schoolId - Student's school ID
 * @returns {Promise<Object>} Add student response
 */
export async function addStudentToClass(classId, schoolId) {
  return await apiRequest('/add-student-to-class', {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      school_id: schoolId
    })
  });
}

/**
 * Remove a student from a class
 * @param {number} classId - Class ID
 * @param {string} schoolId - Student's school ID
 * @returns {Promise<Object>} Remove student response
 */
export async function removeStudentFromClass(classId, schoolId) {
  return await apiRequest('/remove-student-from-class', {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      school_id: schoolId
    })
  });
}

/**
 * Create a new class
 * @param {number} creatorId - Teacher's school ID
 * @param {string} name - Class name
 * @returns {Promise<Object>} Create class response
 */
export async function createClass(creatorId, name) {
  return await apiRequest('/create-class', {
    method: 'POST',
    body: JSON.stringify({
      creator_id: creatorId,
      name: name
    })
  });
}

/**
 * Delete a class
 * @param {number} classId - Class ID
 * @param {number} creatorId - Teacher's school ID
 * @returns {Promise<Object>} Delete class response
 */
export async function deleteClass(classId, creatorId) {
  return await apiRequest('/delete-class', {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      creator_id: creatorId
    })
  });
}

/**
 * Rename a class
 * @param {number} classId - Class ID
 * @param {number} creatorId - Teacher's school ID
 * @param {string} newName - New class name
 * @returns {Promise<Object>} Rename class response
 */
export async function renameClass(classId, creatorId, newName) {
  return await apiRequest('/rename-class', {
    method: 'POST',
    body: JSON.stringify({
      class_id: classId,
      creator_id: creatorId,
      new_name: newName
    })
  });
}

/**
 * Block a post (set validated to 0)
 * @param {number} postId - Post ID
 * @param {string} requesterSchoolId - Teacher's school ID
 * @returns {Promise<Object>} Block post response
 */
export async function blockPost(postId, requesterSchoolId) {
  return await apiRequest('/block-post', {
    method: 'POST',
    body: JSON.stringify({
      post_id: postId,
      requester_school_id: requesterSchoolId
    })
  });
}

/**
 * Validate a post (set validated to 1)
 * @param {number} postId - Post ID
 * @param {string} requesterSchoolId - Teacher's school ID
 * @returns {Promise<Object>} Validate post response
 */
export async function validatePost(postId, requesterSchoolId) {
  return await apiRequest('/validate-post', {
    method: 'POST',
    body: JSON.stringify({
      post_id: postId,
      requester_school_id: requesterSchoolId
    })
  });
}

/**
 * Get pending posts and replies (admin/teacher only)
 * @param {string} requesterSchoolId - School ID of requester
 */
export async function getPendingContent(requesterSchoolId) {
  return await apiRequest(`/pending-content?requester_school_id=${encodeURIComponent(requesterSchoolId)}`, {
    method: 'GET'
  });
}
