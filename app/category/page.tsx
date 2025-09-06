"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import { allPosts } from '../centralData';
import { PostWithReplies } from '../types';
import { getPostsByCategory } from '../api/posts';

const categoryGroups = {
  "School Life": [
    "General",
    "Dorm"
  ],
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

function getPreview(text: string, maxLines = 2) {
  const lines = text.split('\n');
  return lines.slice(0, maxLines).join(' ') + (lines.length > maxLines ? '...' : '');
}

function getAuthorDisplay(isAnonymous: boolean | number, authorId: string, isAdminView: boolean) {
  const anonymous = typeof isAnonymous === 'number' ? isAnonymous === 1 : isAnonymous;
  if (!anonymous) return authorId;
  return isAdminView ? `${authorId} (Anon)` : 'Anonymous';
}


export default function Categories() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const [classPosts, setClassPosts] = useState<PostWithReplies[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [postCounts, setPostCounts] = useState<{ [key: string]: number }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPending, setShowPending] = useState<boolean>(false); // Teacher toggle for pending posts
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user info from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        if (u.is_admin || u.user_type === 'admin') {
          setIsAdmin(true);
        }
      }
    }
  }, []);

  // Check if user is a teacher using localStorage data
  React.useEffect(() => {
    setTeacherLoading(true);
    if (currentUser && currentUser.is_teacher !== undefined) {
      setIsTeacher(currentUser.is_teacher === true);
    } else {
      setIsTeacher(false);
    }
    setTeacherLoading(false);
  }, [currentUser]);

  const toggleReplies = (postId: number) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const loadPostsForClass = async (className: string) => {
    try {
      setLoading(true);
      const requesterSchoolId = currentUser?.school_id;
      // For teachers use the toggle value, for non-teachers use false (don't show pending)
  const showPendingParam = (isTeacher || isAdmin) ? showPending : false;
      console.log('Loading posts for class:', className, 'showPending:', showPendingParam, 'isTeacher:', isTeacher);
      const response: any = await getPostsByCategory(className, requesterSchoolId, showPendingParam);
      if (response.status === 'success') {
        const posts = response.posts.map((post: any) => ({
          ...post,
          replies: post.replies || []
        }));
        console.log('Loaded posts:', posts.length, 'posts for class:', className);
        setClassPosts(posts);
      } else {
        throw new Error(response.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts for class:', error);
      // Fall back to local data
      const fallbackPosts = allPosts.filter(post => post.category === className);
      setClassPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  // Load post counts for all classes in a subject
  const loadPostCountsForSubject = async (subject: keyof typeof categoryGroups) => {
    const classes = categoryGroups[subject];
    const counts: { [key: string]: number } = {};
    try {
      // Load counts for all classes in parallel
      const requesterSchoolId = currentUser?.school_id;
  const showPendingParam = (isTeacher || isAdmin) ? showPending : false;
      console.log('Loading post counts for subject:', subject, 'showPending:', showPendingParam, 'isTeacher:', isTeacher);
      const countPromises = classes.map(async (className) => {
        try {
          const response: any = await getPostsByCategory(className, requesterSchoolId, showPendingParam);
          if (response.status === 'success') {
            counts[className] = response.posts.length;
          } else {
            counts[className] = 0;
          }
        } catch (error) {
          console.error(`Error loading count for ${className}:`, error);
          counts[className] = 0;
        }
      });
      await Promise.all(countPromises);
      console.log('Loaded post counts:', counts);
      setPostCounts(prevCounts => ({ ...prevCounts, ...counts }));
    } catch (error) {
      console.error('Error loading post counts:', error);
    }
  };

  const getPostsForClass = (className: string) => {
    // Return the API-based count, or fall back to local data if not available
    return postCounts[className] !== undefined ? postCounts[className] : allPosts.filter(post => post.category === className).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-transparent to-yellow-500"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #1e40af 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <Navbar />
      <div className="pl-16 md:pl-64 pt-20 relative z-10">
        <main className="max-w-6xl mx-auto p-6 pointer-events-auto">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Browse by Category</h1>

          {/* Admin-only toggle for pending posts */}
          {!teacherLoading && isAdmin && (
            <div className="mb-6 flex items-center gap-4">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPending}
                  onChange={e => {
                    console.log('Pending toggle changed to:', e.target.checked);
                    setShowPending(e.target.checked);
                    // Reload posts/counts if a class/subject is selected
                    if (selectedClass) {
                      console.log('Reloading posts for class:', selectedClass);
                      loadPostsForClass(selectedClass);
                    }
                    if (selectedSubject) {
                      console.log('Reloading post counts for subject:', selectedSubject);
                      loadPostCountsForSubject(selectedSubject as keyof typeof categoryGroups);
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600"
                  style={{ accentColor: '#f59e42' }}
                />
                <span className="ml-2 text-blue-700 font-medium">Show Pending (Unvalidated) Posts (Admin)</span>
              </label>
              <span className="text-xs text-gray-500">(Admins Only)</span>
            </div>
          )}

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
                      console.log('Subject selected:', subject, 'isTeacher:', isTeacher);
                      loadPostCountsForSubject(subject as keyof typeof categoryGroups);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative z-20 pointer-events-auto ${
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
                    const postsCount = getPostsForClass(className);
                    return (
                      <button
                        key={className}
                        onClick={() => {
                          setSelectedClass(className);
                          console.log('Class selected:', className, 'isTeacher:', isTeacher);
                          loadPostsForClass(className);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative z-20 pointer-events-auto ${
                          selectedClass === className
                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                            : 'bg-gray-50 text-gray-900 hover:bg-yellow-50 hover:text-yellow-700 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">{className}</span>
                          <span className="text-sm text-gray-600">
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
                {loading ? (
                  <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
                    <div className="text-blue-600 text-lg">Loading posts...</div>
                  </div>
                ) : classPosts.length === 0 ? (
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
                  classPosts.map((post) => (
                    <div
                      key={post.post_id}
                      className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 
                          className="text-xl font-semibold text-blue-700 hover:text-blue-800 cursor-pointer transition-colors flex-1 mr-4"
                          onClick={() => router.push(`/post/${post.post_id}`)}
                        >
                          {post.title}
                        </h3>
                      </div>
                      
                      <div className="text-gray-600 text-sm mb-3">
                        by <span className="text-blue-600 font-semibold">{getAuthorDisplay(post.anonymous, post.author_id, isAdmin)}</span> • 
                        <span className="text-gray-500 ml-1">{new Date(post.upload_time).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">
                        {getPreview(post.content)}
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
                          {post.replies.slice(0, 3).map((reply) => (
                            <div key={reply.reply_id} className="text-sm text-gray-600 mb-1">
                              <span className="text-blue-600 font-medium">{getAuthorDisplay(reply.anonymous, reply.author_id, isAdmin)}:</span> {reply.content}
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
