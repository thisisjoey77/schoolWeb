"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
// No import of currentUser; we'll use localStorage
import { getMyPosts } from "../api/posts";
import { PostWithReplies } from "../types";


// Dummy user data and posts are commented out to avoid syntax errors

export default function Profile() {
  const [userPosts, setUserPosts] = useState<PostWithReplies[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log('Profile: Loaded user data from localStorage:', userData);
        setCurrentUser(userData);
      } else {
        console.log('Profile: No user data found in localStorage');
      }
      setUserLoading(false);
    }
  }, []);

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
      } else {
        throw new Error(response.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
      setError(`Failed to load your posts: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      // Keep existing posts if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      router.push("/login");
    }
  };

  // Calculate stats
  const totalReplies = userPosts.reduce((total: number, post: PostWithReplies) => total + (post.replies?.length || 0), 0);
  const mostActiveSubject = userPosts.length > 0 
    ? userPosts.reduce((acc: { [key: string]: number }, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1;
        return acc;
      }, {})
    : {};
  const mostActiveSubjectName = Object.keys(mostActiveSubject).length > 0 
    ? Object.keys(mostActiveSubject).reduce((a, b) => mostActiveSubject[a] > mostActiveSubject[b] ? a : b)
    : "None yet";

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
            <h1 className="text-4xl font-bold text-blue-700">My Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Personal Information</h2>
              {userLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : !currentUser ? (
                <div className="text-red-600">
                  User information not found. Please log in again.
                </div>
              ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-semibold">Name:</span>
                  <span className="text-gray-700 ml-2">
                    {currentUser?.given_name || currentUser?.firstName || 'N/A'} {currentUser?.surname || currentUser?.lastName || ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Email:</span>
                  <span className="text-gray-700 ml-2">{currentUser?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Class:</span>
                  <span className="text-gray-700 ml-2">
                    Class of {currentUser?.class || currentUser?.classOf || currentUser?.graduation_year || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Username:</span>
                  <span className="text-gray-700 ml-2">{currentUser?.user_id || currentUser?.username || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Age:</span>
                  <span className="text-gray-700 ml-2">{currentUser?.age || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Intended Major:</span>
                  <span className="text-gray-700 ml-2">{currentUser?.intended_major || currentUser?.major || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Points:</span>
                  <span className="text-yellow-600 ml-2 font-bold">{currentUser?.point || currentUser?.points || 0}</span>
                </div>
              </div>
              )}
            </div>

            {/* Contribution Stats */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Contribution Stats</h2>
              {error && (
                <div className="text-red-600 text-sm mb-2">
                  Error loading stats: {error}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-semibold">Total Posts:</span>
                  <span className="text-yellow-600 ml-2 font-bold">
                    {loading ? "..." : userPosts.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Total Replies Received:</span>
                  <span className="text-yellow-600 ml-2 font-bold">
                    {loading ? "..." : totalReplies}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Most Active Subject:</span>
                  <span className="text-blue-600 ml-2 font-bold">
                    {loading ? "..." : mostActiveSubjectName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* My Posts */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-700">My Recent Posts</h2>
              <button
                onClick={() => currentUser?.user_id && loadMyPosts(currentUser.user_id)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loading ? (
              <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
                <div className="text-blue-600 text-xl">Loading your posts...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 font-medium">Error loading posts</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.slice(0, 5).map((post: PostWithReplies) => (
                <div
                  key={post.post_id}
                  className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl hover:border-yellow-400 transition-all cursor-pointer"
                  onClick={() => window.location.href = `/post/${post.post_id}`}
                >
                  <h3 className="text-xl font-bold text-blue-700 mb-2">{post.title}</h3>
                  <div className="text-gray-600">
                    <span className="font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">{post.category}</span> • 
                    <span className="text-gray-500 ml-1">{new Date(post.upload_time).toLocaleDateString()}</span> • 
                    <span className="text-blue-600 ml-1 font-semibold">{post.replies?.length || 0} replies</span>
                    {post.anonymous === 1 && <span className="text-orange-600 ml-1 font-semibold">• Anonymous</span>}
                    {post.validated === 0 && <span className="text-red-600 ml-1 font-semibold">• Pending Validation</span>}
                  </div>
                </div>
              ))}
              
              {userPosts.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  You haven't posted anything yet. 
                  <a href="/new-post" className="text-blue-600 hover:text-yellow-600 underline ml-1">
                    Create your first post!
                  </a>
                </div>
              )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
