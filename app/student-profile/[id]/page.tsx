"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { PostWithReplies } from '../../types';

interface StudentProfile {
  school_id: string;
  given_name: string;
  surname: string;
  user_id: string;
  email?: string;
  created_at?: string;
  post_count?: number;
  reply_count?: number;
}

interface StudentPost {
  post_id: number;
  title: string;
  content: string;
  category: string;
  upload_time: string;
  anonymous: boolean | number;
  validated: number;
  reply_count?: number;
}

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

function getPreview(text: string, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default function StudentProfile() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [studentPosts, setStudentPosts] = useState<StudentPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  // Check if user is a teacher using API call
  useEffect(() => {
    if (currentUser && currentUser.school_id) {
      checkTeacherStatus(currentUser.school_id);
    }
  }, [currentUser]);

  const checkTeacherStatus = async (schoolId: string) => {
    try {
      setTeacherLoading(true);
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-classes?school_id=${schoolId}`)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.is_teacher) {
        setIsTeacher(true);
      } else if (data.is_teacher === false) {
        setIsTeacher(false);
        router.replace('/');
      } else {
        throw new Error(data.message || 'Failed to verify teacher status');
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
      router.replace('/');
    } finally {
      setTeacherLoading(false);
    }
  };

  // Load student profile
  useEffect(() => {
    if (studentId && isTeacher) {
      loadStudentProfile();
    }
  }, [studentId, isTeacher]);

  // Load student posts after profile is loaded
  useEffect(() => {
    if (studentProfile && studentProfile.user_id) {
      loadStudentPosts();
    }
  }, [studentProfile]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-student-info?school_id=${studentId}`)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.student) {
        setStudentProfile(data.student);
      } else {
        console.error('Failed to load student profile:', data.message);
        alert('Failed to load student profile. Student not found.');
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      alert('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPosts = async () => {
    try {
      setPostsLoading(true);
      
      // Use the user_id from the loaded profile
      const authorId = studentProfile?.user_id;
      
      if (!authorId) {
        console.warn('No user_id available for loading posts');
        setStudentPosts([]);
        return;
      }
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/my-post-list`)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_id: authorId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setStudentPosts(data.posts || []);
      } else {
        console.error('Failed to load student posts:', data.message);
        setStudentPosts([]);
      }
    } catch (error) {
      console.error('Error loading student posts:', error);
      setStudentPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Reload posts when profile is loaded (to get correct user_id)
  useEffect(() => {
    if (studentProfile?.user_id && postsLoading) {
      loadStudentPosts();
    }
  }, [studentProfile?.user_id]);

  if (teacherLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to teachers.</p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Student Not Found</h1>
          <p className="text-gray-600">Could not find student with ID: {studentId}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
        <main className="max-w-4xl mx-auto p-6 pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            Back to Search
          </button>

          {/* Student Profile Header */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {studentProfile.given_name.charAt(0)}{studentProfile.surname.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {studentProfile.given_name} {studentProfile.surname}
                </h1>
                <p className="text-gray-600">Student ID: {studentProfile.school_id}</p>
                {studentProfile.email && (
                  <p className="text-gray-600">Email: {studentProfile.email}</p>
                )}
              </div>
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{studentPosts.length}</div>
                <div className="text-sm text-gray-600">Total Posts</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {studentPosts.filter(post => post.validated === 1).length}
                </div>
                <div className="text-sm text-gray-600">Validated Posts</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {studentPosts.filter(post => post.validated === 0).length}
                </div>
                <div className="text-sm text-gray-600">Pending Posts</div>
              </div>
            </div>
          </div>

          {/* Student Posts */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Posts</h2>
            
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : studentPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
                <p className="text-gray-500">This student hasn't created any posts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentPosts.map((post) => (
                  <div
                    key={post.post_id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/post/${post.post_id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {post.category}
                        </span>
                        {post.validated === 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                        {post.anonymous && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Anonymous
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">
                      {getPreview(post.content)}
                    </p>
                    
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <span>
                        Posted on {new Date(post.upload_time).toLocaleDateString()} at {new Date(post.upload_time).toLocaleTimeString()}
                      </span>
                      <span>
                        Author: {getAuthorDisplay(post.anonymous, studentProfile.school_id, true)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
