"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { createClass, deleteClass, renameClass, searchStudents, addStudentToClass, removeStudentFromClass } from "../api/posts";

interface Student {
  school_id: string;
  given_name: string;
  surname: string;
  user_id: string;
  post_count: number;
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

interface ClassItem {
  class_id: number;
  creator_id: number;
  students: string;
  name: string;
  studentList?: Student[];
}

export default function Classes() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState<Set<number>>(new Set());
  
  // New class creation states
  const [showCreateClass, setShowCreateClass] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>("");
  const [createClassLoading, setCreateClassLoading] = useState<boolean>(false);
  
  // Student management states
  const [showStudentSearch, setShowStudentSearch] = useState<{ [classId: number]: boolean }>({});
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchStudent[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  // More menu states
  const [showMoreMenu, setShowMoreMenu] = useState<{ [classId: number]: boolean }>({});
  
  // Rename class states
  const [showRenameClass, setShowRenameClass] = useState<{ [classId: number]: boolean }>({});
  const [renameClassName, setRenameClassName] = useState<string>("");
  const [renameClassLoading, setRenameClassLoading] = useState<boolean>(false);

  // Ref for menu containers
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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

  // Load classes when user is available
  useEffect(() => {
    if (currentUser && currentUser.school_id) {
      loadClasses(currentUser.school_id);
    }
  }, [currentUser]);

  const loadClasses = async (schoolId: string) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-classes?school_id=${schoolId}`)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.is_teacher) {
        setClasses(data.classes);
      } else if (data.is_teacher === false) {
        setError("Access denied: This page is only available to teachers.");
      } else {
        throw new Error(data.message || 'Failed to load classes');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForClass = async (classItem: ClassItem) => {
    if (!classItem.students) return;
    
    setLoadingStudents(prev => new Set(prev).add(classItem.class_id));
    
    try {
      // Parse the students string (assuming it's comma-separated school IDs)
      const studentIds = classItem.students.split(',').map((id: string) => id.trim()).filter((id: string) => id);
      const students: Student[] = [];
      
      for (const schoolId of studentIds) {
        try {
          // Get student info
          const studentResponse = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-student-info?school_id=${schoolId}`)}`);
          const studentData = await studentResponse.json();
          
          // Get post count
          const postResponse = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-student-post-count?author_id=${studentData.student?.user_id}`)}`);
          const postData = await postResponse.json();
          
          if (studentData.status === 'success' && postData.status === 'success') {
            students.push({
              school_id: schoolId,
              given_name: studentData.student.given_name,
              surname: studentData.student.surname,
              user_id: studentData.student.user_id,
              post_count: postData.post_count
            });
          }
        } catch (error) {
          console.error(`Error loading data for student ${schoolId}:`, error);
        }
      }
      
      // Update the class with student list
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.class_id === classItem.class_id 
            ? { ...cls, studentList: students }
            : cls
        )
      );
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(classItem.class_id);
        return newSet;
      });
    }
  };

  const toggleClass = async (classItem: ClassItem) => {
    const isExpanded = expandedClasses.has(classItem.class_id);
    
    if (isExpanded) {
      // Collapse
      setExpandedClasses(prev => {
        const newSet = new Set(prev);
        newSet.delete(classItem.class_id);
        return newSet;
      });
    } else {
      // Expand
      setExpandedClasses(prev => new Set(prev).add(classItem.class_id));
      
      // Load students if not already loaded
      if (!classItem.studentList) {
        await loadStudentsForClass(classItem);
      }
    }
  };

  const handleMoreMenu = (e: React.MouseEvent, classItem: ClassItem) => {
    e.stopPropagation();
    setShowMoreMenu(prev => ({
      ...prev,
      [classItem.class_id]: !prev[classItem.class_id]
    }));
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !currentUser) return;
    
    setCreateClassLoading(true);
    try {
      const response = await createClass(currentUser.school_id, newClassName.trim()) as ApiResponse;
      if (response.status === 'success') {
        setNewClassName("");
        setShowCreateClass(false);
        // Reload classes
        await loadClasses(currentUser.school_id);
      } else {
        alert(response.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class. Please try again.');
    } finally {
      setCreateClassLoading(false);
    }
  };

  const handleDeleteClass = async (classItem: ClassItem) => {
    if (!currentUser) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the class "${classItem.name}"?`);
    if (!confirmDelete) return;
    
    try {
      const response = await deleteClass(classItem.class_id, currentUser.school_id) as ApiResponse;
      if (response.status === 'success') {
        // Reload classes
        await loadClasses(currentUser.school_id);
        // Close more menu
        setShowMoreMenu(prev => ({
          ...prev,
          [classItem.class_id]: false
        }));
      } else {
        alert(response.message || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const handleRenameClass = async (classItem: ClassItem) => {
    if (!renameClassName.trim() || !currentUser) return;
    
    setRenameClassLoading(true);
    try {
      const response = await renameClass(classItem.class_id, currentUser.school_id, renameClassName.trim()) as ApiResponse;
      if (response.status === 'success') {
        // Reload classes
        await loadClasses(currentUser.school_id);
        // Close rename modal and more menu
        setShowRenameClass(prev => ({
          ...prev,
          [classItem.class_id]: false
        }));
        setShowMoreMenu(prev => ({
          ...prev,
          [classItem.class_id]: false
        }));
        setRenameClassName("");
      } else {
        alert(response.message || 'Failed to rename class');
      }
    } catch (error) {
      console.error('Error renaming class:', error);
      alert('Failed to rename class. Please try again.');
    } finally {
      setRenameClassLoading(false);
    }
  };

  const handleSearchStudents = async () => {
    if (!studentSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await searchStudents(studentSearchQuery.trim()) as ApiResponse;
      if (response.status === 'success') {
        setSearchResults(response.students || []);
      } else {
        console.error('Error searching students:', response.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddStudent = async (student: SearchStudent, classId: number) => {
    if (!currentUser) return;
    
    try {
      const response = await addStudentToClass(classId, student.school_id) as ApiResponse;
      if (response.status === 'success') {
        // Preserve expanded state before reloading
        const currentExpandedClasses = new Set(expandedClasses);
        
        // Reload classes to get updated student lists
        await loadClasses(currentUser.school_id);
        
        // Restore expanded state and reload students for expanded classes
        setExpandedClasses(currentExpandedClasses);
        
        // Use a ref to trigger student reload after classes are updated
        setTimeout(() => {
          setClasses(prevClasses => {
            const updatedClass = prevClasses.find(cls => cls.class_id === classId);
            if (updatedClass && currentExpandedClasses.has(classId)) {
              loadStudentsForClass(updatedClass);
            }
            return prevClasses;
          });
        }, 0);
        
        // Close search modal
        setShowStudentSearch({});
        setStudentSearchQuery("");
        setSearchResults([]);
        setSelectedClassId(null);
      } else {
        alert(response.message || 'Failed to add student to class');
      }
    } catch (error) {
      console.error('Error adding student to class:', error);
      alert('Failed to add student to class. Please try again.');
    }
  };

  const handleRemoveStudent = async (student: Student, classId: number) => {
    if (!currentUser) return;
    
    const confirmRemove = window.confirm(`Are you sure you want to remove ${student.given_name} ${student.surname} from this class?`);
    if (!confirmRemove) return;
    
    try {
      const response = await removeStudentFromClass(classId, student.school_id) as ApiResponse;
      if (response.status === 'success') {
        // Reload classes to update student lists
        await loadClasses(currentUser.school_id);
      } else {
        alert(response.message || 'Failed to remove student from class');
      }
    } catch (error) {
      console.error('Error removing student from class:', error);
      alert('Failed to remove student from class. Please try again.');
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let clickedInside = false;
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && ref.contains(event.target as Node)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setShowMoreMenu({});
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search students when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (studentSearchQuery.trim()) {
        handleSearchStudents();
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [studentSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pl-64 pt-20">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-blue-600 text-xl">Loading classes...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pl-64 pt-20">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-red-600 text-xl mb-4">{error}</div>
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pl-64 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">My Classes</h1>
              <p className="text-gray-600">Manage your classes and view student activity</p>
            </div>
            <button
              onClick={() => setShowCreateClass(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Class
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Classes Found</h2>
              <p className="text-gray-500">You don't have any classes assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((classItem) => {
                const isExpanded = expandedClasses.has(classItem.class_id);
                const isLoadingStudents = loadingStudents.has(classItem.class_id);
                
                return (
                  <div
                    key={classItem.class_id}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 relative"
                  >
                    {/* Class Header */}
                    <div
                      className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleClass(classItem)}
                    >
                      {/* Dropdown Arrow */}
                      <div className={`mr-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Class Name */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-700">{classItem.name}</h3>
                        <p className="text-sm text-gray-600">
                          Class ID: {classItem.class_id} • 
                          {classItem.students ? classItem.students.split(',').filter((id: string) => id.trim()).length : 0} students
                        </p>
                      </div>
                      
                      {/* More Menu Button */}
                      <div className="relative z-10" ref={el => {menuRefs.current[classItem.class_id] = el;}}>
                        <button
                          onClick={(e) => handleMoreMenu(e, classItem)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* More Menu Dropdown - Positioned outside the card container */}
                    {showMoreMenu[classItem.class_id] && (
                      <div 
                        className="absolute right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] min-w-48"
                        style={{
                          top: '60px', // Position it below the header
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClassId(classItem.class_id);
                            setShowStudentSearch(prev => ({
                              ...prev,
                              [classItem.class_id]: true
                            }));
                            setShowMoreMenu(prev => ({
                              ...prev,
                              [classItem.class_id]: false
                            }));
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-800"
                        >
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-gray-900">Add Student</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameClassName(classItem.name);
                            setShowRenameClass(prev => ({
                              ...prev,
                              [classItem.class_id]: true
                            }));
                            setShowMoreMenu(prev => ({
                              ...prev,
                              [classItem.class_id]: false
                            }));
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-800"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-gray-900">Rename</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(classItem);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-red-600">Delete Class</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Expanded Student List */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg overflow-hidden">
                        {isLoadingStudents ? (
                          <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">Loading students...</p>
                          </div>
                        ) : classItem.studentList && classItem.studentList.length > 0 ? (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Students</h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClassId(classItem.class_id);
                                  setShowStudentSearch(prev => ({
                                    ...prev,
                                    [classItem.class_id]: true
                                  }));
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Student
                              </button>
                            </div>
                            <div className="space-y-2">
                              {classItem.studentList.map((student) => (
                                <div
                                  key={student.school_id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                                  onClick={() => router.push(`/student-profile/${student.school_id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                      {student.given_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {student.given_name} {student.surname}
                                      </p>
                                      <p className="text-sm text-gray-600">ID: {student.school_id}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-blue-600">{student.post_count}</p>
                                      <p className="text-xs text-gray-500">posts</p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveStudent(student, classItem.class_id);
                                      }}
                                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                      title="Remove student"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-gray-600 mb-3">No students in this class yet.</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClassId(classItem.class_id);
                                setShowStudentSearch(prev => ({
                                  ...prev,
                                  [classItem.class_id]: true
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add First Student
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Create Class Modal */}
          {showCreateClass && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Class</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter class name"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateClass(false);
                      setNewClassName("");
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                    disabled={createClassLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateClass}
                    disabled={!newClassName.trim() || createClassLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {createClassLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Student Search Modal */}
          {Object.values(showStudentSearch).some(Boolean) && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-hidden flex flex-col shadow-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Student to Class</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Search Students
                  </label>
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter student name or student ID number"
                    autoFocus
                  />
                </div>
                
                {/* Search Results */}
                <div className="flex-1 overflow-y-auto mb-4">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-700">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((student) => (
                        <div
                          key={student.school_id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {student.given_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.given_name} {student.surname}
                              </p>
                              <p className="text-sm text-gray-700">ID: {student.school_id} • Class: {student.class || 'N/A'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => selectedClassId && handleAddStudent(student, selectedClassId)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : studentSearchQuery.trim() ? (
                    <div className="text-center py-4">
                      <p className="text-gray-700">No students found</p>
                      <p className="text-sm text-gray-600 mt-1">Try searching by name or student ID number</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-700">Start typing to search for students</p>
                      <p className="text-sm text-gray-600 mt-1">You can search by name or student ID number</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowStudentSearch({});
                      setStudentSearchQuery("");
                      setSearchResults([]);
                      setSelectedClassId(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Rename Class Modal */}
          {Object.values(showRenameClass).some(Boolean) && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename Class</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={renameClassName}
                    onChange={(e) => setRenameClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter new class name"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRenameClass({});
                      setRenameClassName("");
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                    disabled={renameClassLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const classId = Object.keys(showRenameClass).find(key => showRenameClass[parseInt(key)]);
                      if (classId) {
                        const classItem = classes.find(c => c.class_id === parseInt(classId));
                        if (classItem) {
                          handleRenameClass(classItem);
                        }
                      }
                    }}
                    disabled={!renameClassName.trim() || renameClassLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {renameClassLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    Rename
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
