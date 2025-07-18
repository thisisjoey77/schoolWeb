"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { getMyPosts } from "../api/posts";
import { PostWithReplies } from "../types";

function getAuthorDisplay(isAnonymous: boolean | number, authorId: string, isTeacher: boolean) {
	// Convert number to boolean if needed (database stores as tinyint)
	const anonymous = typeof isAnonymous === 'number' ? isAnonymous === 1 : isAnonymous;
	
	// If not anonymous, always show author
	if (!anonymous) {
		return authorId;
	}
	
	// If anonymous and current user is teacher, show actual author with indicator
	if (anonymous && isTeacher) {
		return `${authorId} (Posted Anonymously)`;
	}
	
	// If anonymous and current user is not teacher, show Anonymous
	return 'Anonymous';
}

export default function MyPosts() {
  const router = useRouter();
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const [userPosts, setUserPosts] = useState<PostWithReplies[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    }
  }, []);

  // Check if user is a teacher using localStorage data
  useEffect(() => {
    setTeacherLoading(true);
    if (currentUser && currentUser.is_teacher !== undefined) {
      setIsTeacher(currentUser.is_teacher === true);
    } else {
      setIsTeacher(false);
    }
    setTeacherLoading(false);
  }, [currentUser]);

  // Load user's posts on component mount (after user info is loaded)
  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      loadMyPosts(currentUser.user_id);
    }
  }, [currentUser]);

  const loadMyPosts = async (userId: string) => {
    try {
      setLoading(true);
      setError("");
      console.log('Loading my posts for user:', userId);
      const response: any = await getMyPosts(userId);
      
      if (response.status === 'success') {
        const posts = response.posts.map((post: any) => ({
          ...post,
          replies: post.replies || []
        }));
        setUserPosts(posts);
        if (response.message && response.message.includes('fallback')) {
          setError(`Note: ${response.message}`);
        }
      } else {
        throw new Error(response.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
      setError(`Failed to load your posts: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (postId: number) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-transparent to-yellow-500"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #1e40af 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <Navbar />
      <div className="pl-16 md:pl-64 pt-20 relative z-10">
        <main className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-700">My Posts</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => currentUser?.user_id && loadMyPosts(currentUser.user_id)}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={() => router.push('/new-post')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + New Post
              </button>
            </div>
          </div>

          {error && (
            <div className={`border rounded-lg p-4 mb-6 ${
              error.includes('Note:') 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`font-medium ${
                error.includes('Note:') 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
              }`}>
                {error.includes('Note:') ? 'Information' : 'Error'}
              </div>
              <div className={error.includes('Note:') 
                ? 'text-yellow-700' 
                : 'text-red-700'
              }>
                {error}
              </div>
            </div>
          )}

          {loading || teacherLoading ? (
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-blue-600 text-xl">Loading your posts...</div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h2>
              <p className="text-gray-500 mb-4">You haven't created any posts yet. Start sharing your thoughts!</p>
              <button
                onClick={() => router.push('/new-post')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post: any) => (
                <div key={post.post_id} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 
                      className="text-xl font-semibold text-blue-700 hover:text-blue-800 cursor-pointer transition-colors"
                      onClick={() => router.push(`/post/${post.post_id}`)}
                    >
                      {post.title}
                    </h2>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-sm mb-3">
                    by <span className="text-blue-600 font-semibold">
                      {post.anonymous ? 
                        `${currentUser?.given_name || ''} ${currentUser?.surname || ''} (Posted Anonymously)` : 
                        `${currentUser?.given_name || ''} ${currentUser?.surname || ''}`
                      }
                    </span> • 
                    <span className="text-gray-500 ml-1">{new Date(post.upload_time).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.content.split('\n')[0]}...
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleReplies(post.post_id)}
                      className="text-blue-600 hover:text-yellow-600 text-sm font-medium transition-colors"
                    >
                      {showReplies[post.post_id] ? 'Hide' : 'View'} replies ({post.replies.length})
                    </button>
                    <button
                      onClick={() => router.push(`/post/${post.post_id}`)}
                      className="text-blue-600 hover:text-yellow-600 text-sm font-medium transition-colors"
                    >
                      View Full Post →
                    </button>
                  </div>
                  
                  {showReplies[post.post_id] && post.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Replies:</h4>
                      {post.replies.slice(0, 3).map((reply: any) => (
                        <div key={reply.reply_id} className="text-sm text-gray-600 mb-1">
                          <span className="text-blue-600 font-medium">{getAuthorDisplay(reply.anonymous, reply.author_id, isTeacher)}:</span> {reply.content}
                        </div>
                      ))}
                      {post.replies.length > 3 && (
                        <div className="text-xs text-gray-500 mt-2">
                          And {post.replies.length - 3} more replies...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
