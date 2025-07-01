"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { PostWithReplies } from "../../types";

// Dummy data (should be replaced with real data/fetch in production)
const dummyPosts: PostWithReplies[] = [
  {
    post_id: 1,
    title: "Welcome to School Reddit!",
    author_id: "admin",
    upload_time: "2025-06-24T10:00:00Z",
    category: "General",
    content: `This is a platform for students to share questions, ideas, and discussions.\nFeel free to post anything related to school life, academics, or events.\nLet's build a helpful community together!`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 1,
        author_id: "alice",
        parent_post_id: 1,
        upload_time: "2025-06-24T11:00:00Z",
        content: "Great idea! Looking forward to using this.",
        anonymous: 0,
        validated: 1
      },
      {
        reply_id: 2,
        author_id: "bob",
        parent_post_id: 1,
        upload_time: "2025-06-24T12:00:00Z",
        content: "Excited to see more posts!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 2,
    title: "AP Calculus AB - Derivatives Help",
    author_id: "alice",
    upload_time: "2025-06-23T14:30:00Z",
    category: "AP Calculus AB",
    content: `Can someone explain the chain rule for derivatives?\nI keep getting confused with composite functions.\nAny tips or practice problems?`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 3,
        author_id: "bob",
        parent_post_id: 2,
        upload_time: "2025-06-23T15:45:00Z",
        content: "Try breaking it down step by step!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 3,
    title: "AP Physics C: Mechanics - Force Diagrams",
    author_id: "bob",
    upload_time: "2025-06-22T09:15:00Z",
    category: "AP Physics C: Mechanics",
    content: `Stuck on Newton's laws problems with multiple objects.\nHow do you approach complex force diagrams?\nAny resources would be appreciated.`,
    anonymous: 0,
    validated: 1,
    replies: [],
  },
  {
    post_id: 4,
    title: "AP Biology Study Group",
    author_id: "carol",
    upload_time: "2025-06-21T16:45:00Z",
    category: "AP Biology",
    content: `Anyone interested in forming a study group for the upcoming AP Biology exam?\nWe can meet after school or online.\nLet me know if you're interested!`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 4,
        author_id: "admin",
        parent_post_id: 4,
        upload_time: "2025-06-21T17:00:00Z",
        content: "Count me in!",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 5,
    title: "AP English Literature - Essay Writing",
    author_id: "sarah",
    upload_time: "2025-06-20T13:20:00Z",
    category: "AP English Literature",
    content: `Tips for writing strong thesis statements?\nStruggling with poetry analysis essays.\nHow do you structure your arguments?`,
    anonymous: 0,
    validated: 1,
    replies: [
      {
        reply_id: 5,
        author_id: "alice",
        parent_post_id: 5,
        upload_time: "2025-06-20T14:30:00Z",
        content: "Start with a clear claim about the text's meaning.",
        anonymous: 0,
        validated: 1
      }
    ],
  },
  {
    post_id: 6,
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
    post_id: 7,
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

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id ? Number(params.id) : 0;
  const post = dummyPosts.find((p) => p.post_id === postId);

  if (!post) {
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
          <main className="max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Go Back Home
            </button>
          </main>
        </div>
      </div>
    );
  }

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
        <main className="max-w-3xl mx-auto p-4">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-yellow-600 font-medium"
          >
            ← Back
          </button>
          
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="mb-4">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              {post.anonymous === 1 && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium ml-2">
                  Anonymous
                </span>
              )}
              {post.validated === 0 && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium ml-2">
                  Pending Validation
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-blue-700 mb-4">{post.title}</h1>
            
            <div className="text-gray-600 mb-4">
              by <span className="text-blue-600 font-semibold">
                {post.anonymous ? 'Anonymous' : post.author_id}
              </span> • 
              <span className="text-gray-500 ml-1">
                {new Date(post.upload_time).toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-gray-700 whitespace-pre-wrap mb-6">
              {post.content}
            </div>
            
            {/* Replies Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Replies ({post.replies.length})
              </h2>
              
              {post.replies.length === 0 ? (
                <p className="text-gray-500">No replies yet. Be the first to reply!</p>
              ) : (
                <div className="space-y-4">
                  {post.replies.map((reply) => (
                    <div key={reply.reply_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">
                        <span className="text-blue-600 font-semibold">
                          {reply.anonymous ? 'Anonymous' : reply.author_id}
                        </span> • 
                        <span className="text-gray-500 ml-1">
                          {new Date(reply.upload_time).toLocaleDateString()}
                        </span>
                        {reply.validated === 0 && (
                          <span className="text-red-600 ml-2 text-xs">• Pending Validation</span>
                        )}
                      </div>
                      <div className="text-gray-700">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
