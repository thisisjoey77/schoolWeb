import { apiRequest } from './config.js';

/**
 * Student login check
 * @param {string} username - User ID
 * @param {string} password - Password
 * @returns {Promise<Object>} Login response
 */
export async function loginCheckStudent(username, password) {
  return await apiRequest('/login-check-student', {
    method: 'POST',
    body: JSON.stringify({
      user_id: username,
      password: password
    })
  });
}

/**
 * Teacher login check
 * @param {string} username - User ID
 * @param {string} password - Password
 * @returns {Promise<Object>} Login response
 */
export async function loginCheckTeacher(username, password) {
  return await apiRequest('/login-check-teacher', {
    method: 'POST',
    body: JSON.stringify({
      user_id: username,
      password: password
    })
  });
}

/**
 * Admin login check
 * @param {string} username - User ID
 * @param {string} password - Password
 * @returns {Promise<Object>} Login response
 */
export async function loginCheckAdmin(username, password) {
  return await apiRequest('/login-check-admin', {
    method: 'POST',
    body: JSON.stringify({
      user_id: username,
      password: password
    })
  });
}

/**
 * Student sign up
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export async function signUp(userData) {
  const {
    userId,
    password,
    givenName,
    surname,
    age,
    schoolId,
    intendedMajor,
    email,
    classOf
  } = userData;

  return await apiRequest('/sign-up', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      password: password,
      given_name: givenName,
      surname: surname,
      age: age,
      school_id: schoolId,
      intended_major: intendedMajor,
      email: email,
      class: classOf
    })
  });
}
