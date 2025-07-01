"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

const categoryGroups = {
  "Mathematics": [
    "AP Calculus AB", 
    "AP Calculus BC",
    "Algebra 1",
    "Algebra 2", 
    "Geometry",
    "Pre-Calculus",
    "Statistics"
  ],
  "Science": [
    "Physics 1",
    "AP Physics 1",
    "AP Physics 2", 
    "AP Physics C: Mechanics",
    "AP Physics C: E&M",
    "Chemistry",
    "AP Chemistry",
    "Honors Chemistry",
    "Biology",
    "AP Biology",
    "Honors Biology",
    "Environmental Science",
    "AP Environmental Science"
  ],
  "English": [
    "English 9",
    "English 10", 
    "English 11",
    "English 12",
    "AP English Language",
    "AP English Literature"
  ],
  "Social Studies": [
    "World History",
    "US History",
    "AP World History",
    "AP US History",
    "AP European History",
    "Government",
    "AP Government",
    "Economics",
    "AP Economics"
  ],
  "Foreign Languages": [
    "Spanish 1",
    "Spanish 2",
    "Spanish 3",
    "AP Spanish",
    "French 1",
    "French 2", 
    "French 3",
    "AP French"
  ],
  "Computer Science": [
    "Computer Science",
    "AP Computer Science A",
    "AP Computer Science Principles"
  ],
  "Arts & Other": [
    "Art",
    "AP Art",
    "Music",
    "Band",
    "Orchestra",
    "Choir",
    "Theater",
    "PE/Health",
    "Study Hall",
    "Other"
  ]
};

const dummyPosts = [
  {
    id: 1,
    title: "Welcome to School Reddit!",
    author: "admin",
    time: "2025-06-24",
    category: "General",
    content: `This is a platform for students to share questions, ideas, and discussions.\nFeel free to post anything related to school life, academics, or events.\nLet's build a helpful community together!`,
    replies: [
      { id: 1, author: "alice", content: "Great idea! Looking forward to using this." },
      { id: 2, author: "bob", content: "Excited to see more posts!" },
    ],
  },
  {
    id: 2,
    title: "AP Calculus AB - Derivatives Help",
    author: "alice",
    time: "2025-06-23",
    category: "AP Calculus AB",
    content: `Can someone explain the chain rule for derivatives?\nI keep getting confused with composite functions.\nAny tips or practice problems?`,
    replies: [
      { id: 1, author: "bob", content: "Try breaking it down step by step!" },
    ],
  },
  {
    id: 3,
    title: "AP Physics C: Mechanics - Force Diagrams",
    author: "bob",
    time: "2025-06-22",
    category: "AP Physics C: Mechanics",
    content: `Stuck on Newton's laws problems with multiple objects.\nHow do you approach complex force diagrams?\nAny resources would be appreciated.`,
    replies: [],
  },
  {
    id: 4,
    title: "AP Biology Study Group",
    author: "carol",
    time: "2025-06-21",
    category: "AP Biology",
    content: `Anyone interested in forming a study group for the upcoming AP Biology exam?\nWe can meet after school or online.\nLet me know if you're interested!`,
    replies: [
      { id: 1, author: "admin", content: "Count me in!" },
    ],
  },
  {
    id: 5,
    title: "AP English Literature - Essay Writing",
    author: "sarah",
    time: "2025-06-20",
    category: "AP English Literature",
    content: `Tips for writing strong thesis statements?\nStruggling with poetry analysis essays.\nHow do you structure your arguments?`,
    replies: [
      { id: 1, author: "alice", content: "Start with a clear claim about the text's meaning." },
    ],
  },
];

function getPreview(text: string, maxLines = 2) {
  const lines = text.split('\n');
  return lines.slice(0, maxLines).join(' ') + (lines.length > maxLines ? '...' : '');
}

export default function Categories() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const router = useRouter();

  const toggleReplies = (postId: number) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const getPostsForClass = (className: string) => {
    return dummyPosts.filter(post => post.category === className);
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
      <div className="pl-64 pt-20">
        <main className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Browse by Category</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Select Subject</h2>
              <div className="space-y-2">
                {Object.keys(categoryGroups).map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setSelectedClass('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedSubject === subject
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-transparent'
                    }`}
                  >
                    <span className="font-medium">{subject}</span>
                    <div className="text-sm text-gray-500 mt-1">
                      {categoryGroups[subject as keyof typeof categoryGroups].length} classes
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Class Selection */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                {selectedSubject ? `${selectedSubject} Classes` : 'Select a Subject First'}
              </h2>
              {selectedSubject ? (
                <div className="space-y-2">
                  {categoryGroups[selectedSubject as keyof typeof categoryGroups].map((className) => {
                    const postsCount = getPostsForClass(className).length;
                    return (
                      <button
                        key={className}
                        onClick={() => setSelectedClass(className)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                          selectedClass === className
                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                            : 'bg-gray-50 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{className}</span>
                          <span className="text-sm text-gray-500">
                            {postsCount} thread{postsCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Choose a subject from the left to see available classes
                </div>
              )}
            </div>
          </div>

          {/* Class Posts */}
          {selectedClass && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700">
                  {selectedClass} - Discussion Threads
                </h2>
                <button
                  onClick={() => router.push(`/new-post?category=${encodeURIComponent(selectedClass)}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  Add New Post
                </button>
              </div>

              <div className="space-y-4">
                {getPostsForClass(selectedClass).length === 0 ? (
                  <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to start a discussion in {selectedClass}!</p>
                    <button
                      onClick={() => router.push(`/new-post?category=${encodeURIComponent(selectedClass)}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  getPostsForClass(selectedClass).map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 
                          className="text-xl font-semibold text-blue-700 hover:text-blue-800 cursor-pointer transition-colors flex-1 mr-4"
                          onClick={() => router.push(`/post/${post.id}`)}
                        >
                          {post.title}
                        </h3>
                      </div>
                      
                      <div className="text-gray-600 text-sm mb-3">
                        by <span className="text-blue-600 font-semibold">{post.author}</span> • 
                        <span className="text-gray-500 ml-1">{post.time}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        {getPreview(post.content)}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => toggleReplies(post.id)}
                          className="text-blue-600 hover:text-yellow-600 text-sm font-medium transition-colors"
                        >
                          {showReplies[post.id] ? 'Hide' : 'View'} replies ({post.replies.length})
                        </button>
                        <button
                          onClick={() => router.push(`/post/${post.id}`)}
                          className="text-blue-600 hover:text-yellow-600 text-sm font-medium transition-colors"
                        >
                          View Full Post →
                        </button>
                      </div>
                      
                      {showReplies[post.id] && post.replies.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Replies:</h4>
                          {post.replies.slice(0, 3).map((reply) => (
                            <div key={reply.id} className="text-sm text-gray-600 mb-1">
                              <span className="text-blue-600 font-medium">{reply.author}:</span> {reply.content}
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
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
