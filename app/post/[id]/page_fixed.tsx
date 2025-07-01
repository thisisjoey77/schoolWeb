"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { PostWithReplies } from "../../types";

// Dummy data removed. Fetch real data from backend in production.

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id ? Number(params.id) : 0;
  // Replace the following with a real fetch:
  const post: PostWithReplies | undefined = undefined;

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

  return null;
}
