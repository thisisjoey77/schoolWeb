# API Integration Guide

This directory contains JavaScript API functions that correspond to your FastAPI backend endpoints.

## Structure

```
app/api/
├── config.js      # Base configuration and helper functions
├── auth.js        # Authentication endpoints
├── posts.js       # Post-related endpoints
├── replies.js     # Reply-related endpoints
└── index.js       # Main exports file
```

## Setup

1. **Configure Environment Variables**: Create a `.env.local` file in your project root and add your API configuration:
   ```
   API_BASE_URL=http://your-fastapi-server.com:8000
   ```

2. **Start your FastAPI server**: Make sure your `main.py` is running:
   ```bash
   cd /Users/joykim/Desktop/school_web
   uvicorn main:app --reload
   ```

## Usage Examples

### Authentication

```javascript
import { loginCheckStudent, signUp } from './api/auth.js';

// Student login
const loginResult = await loginCheckStudent('username', 'password');
if (loginResult.status === 'success') {
  console.log('Login successful!');
}

// Student registration
const userData = {
  userId: 'newuser123',
  password: 'securepassword',
  givenName: 'John',
  surname: 'Doe',
  age: '16',
  schoolId: '12345',
  intendedMajor: 'Computer Science',
  email: 'john.doe@example.com',
  classOf: '2026'
};
const signupResult = await signUp(userData);
```

### Posts

```javascript
import { postUpload, getPostList, getMyPosts } from './api/posts.js';

// Create a new post
const newPost = await postUpload({
  uploadTime: new Date().toISOString(),
  title: 'My New Post',
  content: 'This is the content of my post',
  authorId: 'username',
  anonymous: 0, // 0 = not anonymous, 1 = anonymous
  category: 'General'
});

// Get all posts
const allPosts = await getPostList();

// Get user's posts
const myPosts = await getMyPosts('username');
```

### Replies

```javascript
import { getPostReplies, postReply } from './api/replies.js';

// Get replies for a post
const replies = await getPostReplies(123);

// Post a reply
const replyData = await postReply({
  uploadTime: new Date().toISOString(),
  parentPostId: 123,
  content: 'This is my reply',
  authorId: 'username',
  anonymous: 0
});
```

## Integration with React Components

### Example: Using in a React component

```jsx
import React, { useState, useEffect } from 'react';
import { getPostList } from '../api/posts.js';

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await getPostList();
        if (response.status === 'success') {
          setPosts(response.posts);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <div key={post.post_id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

All API functions include error handling. They will:
1. Log errors to the console
2. Throw the error for you to handle in your components
3. Include helpful error messages

```javascript
try {
  const result = await loginCheckStudent('user', 'pass');
  // Handle success
} catch (error) {
  // Handle error
  console.error('Login failed:', error.message);
  alert('Login failed. Please try again.');
}
```

## API Endpoints Mapping

| API Function | FastAPI Endpoint | Method | Description |
|-------------|------------------|---------|-------------|
| `loginCheckStudent` | `/login-check-student` | POST | Student login |
| `loginCheckTeacher` | `/login-check-teacher` | GET | Teacher login |
| `signUp` | `/sign-up` | POST | Student registration |
| `postUpload` | `/post-upload` | POST | Create new post |
| `getPostList` | `/post-list` | GET | Get all posts |
| `getPostsByCategory` | `/post-by-category` | GET | Get posts by category |
| `getMyPosts` | `/my-post-list` | POST | Get user's posts |
| `getPostReplies` | `/get-post-replies` | GET | Get post replies |
| `postReply` | `/post-reply` | POST | Create reply |

## Next Steps

1. Replace your current local data (`centralData.ts`) with API calls
2. Update your components to use these API functions
3. Add proper loading states and error handling
4. Consider adding authentication state management
5. Add TypeScript types for better type safety

## Notes

- The current implementation includes fallback to local state if API calls fail
- Make sure your FastAPI server is running and accessible
- Update the `API_BASE_URL` in `config.js` to match your server setup
- Consider adding authentication tokens if needed for security
