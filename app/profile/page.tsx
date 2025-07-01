"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { currentUser } from "../userData";
import { getMyPosts } from "../api/posts";
import { PostWithReplies } from "../types";

// Dummy user data (in production, this would come from your backend/auth system)
// const currentUser = {
//   givenName: "John",
//   surname: "Smith", 
//   email: "john.smith@school.edu",
//   classNumber: "Class of 2025",
//   userId: "johnsmith123",
//   joinDate: "2024-09-01"
// };

// Dummy posts data for user contributions
// const userPosts = [
//   {
//     id: 2,
//     title: "AP Calculus AB - Derivatives Help",
//     category: "AP Calculus AB",
//     time: "2025-06-23",
//     repliesCount: 1
//   },
//   {
//     id: 6,
//     title: "Study Tips for Finals",
//     category: "General",
//     time: "2025-06-20",
//     repliesCount: 3
//   },
//   {
//     id: 7,
//     title: "Chemistry Lab Safety Question",
//     category: "AP Chemistry", 
//     time: "2025-06-18",
//     repliesCount: 0
//   }
// ];

export default function Profile() {
  const [userPosts, setUserPosts] = useState<PostWithReplies[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Load user's posts on component mount
  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const response: any = await getMyPosts(currentUser.user_id);
      
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
      setError('Failed to load your posts. Please try again.');
      // Keep existing posts if API fails
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold mb-6 text-blue-700">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-semibold">Name:</span>
                  <span className="text-gray-700 ml-2">{currentUser.given_name} {currentUser.surname}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Email:</span>
                  <span className="text-gray-700 ml-2">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Class:</span>
                  <span className="text-gray-700 ml-2">Class of {currentUser.class}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Username:</span>
                  <span className="text-gray-700 ml-2">{currentUser.user_id}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Age:</span>
                  <span className="text-gray-700 ml-2">{currentUser.age}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Intended Major:</span>
                  <span className="text-gray-700 ml-2">{currentUser.intended_major}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Points:</span>
                  <span className="text-yellow-600 ml-2 font-bold">{currentUser.point}</span>
                </div>
              </div>
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
                onClick={loadMyPosts}
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
