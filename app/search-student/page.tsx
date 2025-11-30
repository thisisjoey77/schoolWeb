"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

interface Student {
  school_id: string;
  given_name: string;
  surname: string;
  user_id: string;
  email?: string;
  class?: string;
}

interface SearchStudent {
  school_id: string;
  given_name: string;
  surname: string;
  user_id?: string;
  class?: string;
  email?: string;
}

interface ApiResponse {
  status: string;
  message?: string;
  students?: SearchStudent[];
}

export default function SearchStudent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchStudent[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
        const userStr = window.localStorage.getItem("currentUser");
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        if (u.is_admin || u.user_type === 'admin') {
          setIsAdmin(true);
        }
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  // Check if user is a teacher using API call
  useEffect(() => {
    if (!currentUser) return;
    // If admin, skip teacher check
    if (isAdmin) {
      setTeacherLoading(false);
      return;
    }
    if (currentUser.school_id) {
      checkTeacherStatus(currentUser.school_id);
    }
  }, [currentUser, isAdmin]);

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

  const searchStudentsHandler = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a student ID to search.');
      return;
    }
    if (!currentUser?.school_id) {
      alert('Missing your school ID. Please re-login.');
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      // Try to get student info directly by school_id (if it's a direct ID search)
  const endpoint = `/get-student-info?school_id=${encodeURIComponent(searchQuery.trim())}&requester_school_id=${encodeURIComponent(currentUser.school_id)}`;
  const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.student) {
        // Convert the single student response to our expected format
        const student: SearchStudent = {
          school_id: data.student.school_id,
          given_name: data.student.given_name,
          surname: data.student.surname,
          user_id: data.student.user_id,
          email: data.student.email,
          class: data.student.class
        };
        setSearchResults([student]);
      } else {
        console.log('No student found with that ID:', data.message);
        setSearchResults([]);
        // Don't show alert for no results, just show the "no results" message
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
      alert('Failed to search students. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewProfile = (student: SearchStudent) => {
    // Navigate to a student profile page with the student's school_id (which is what the API expects)
    router.push(`/student-profile/${student.school_id}`);
  };

  if (teacherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!(isTeacher || isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to teachers and admins.</p>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">Search Student</h1>
            <p className="text-gray-800">Search for students by their ID number to view their profiles and activity.</p>
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded mt-2 inline-block">(Teachers & Admins)</span>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Student Search</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchStudentsHandler()}
                  placeholder="Enter student ID number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={searchStudentsHandler}
                  disabled={searchLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found)
                  </span>
                )}
              </h2>
              
              {searchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching students...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No students found</h3>
                  <p className="text-gray-500">Try searching with a different student ID.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((student, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {student.given_name} {student.surname}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Student ID:</span> {student.school_id}
                          </div>
                          {student.email && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {student.email}
                            </div>
                          )}
                          {student.class && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Class:</span> {student.class}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
