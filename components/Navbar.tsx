"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  console.log('Navbar: Current isTeacher state:', isTeacher);

  // Load user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log('Navbar: Loaded user data from localStorage:', userData);
        setCurrentUser(userData);
        
        // Check if user is already marked as teacher in localStorage
        if (userData.user_type === 'teacher') {
          console.log('Navbar: User already marked as teacher in localStorage');
          setIsTeacher(true);
        }
        
        // Always check teacher status from backend to be sure
        if (userData.school_id) {
          console.log('Navbar: Checking teacher status for school_id:', userData.school_id);
          checkIfTeacher(userData.school_id);
        }
      } else {
        console.log('Navbar: No user data found in localStorage');
      }
    }
  }, []);

  const checkIfTeacher = async (schoolId: string) => {
    try {
      console.log('Navbar: Making teacher check request for school_id:', schoolId);
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(`/get-classes?school_id=${schoolId}`)}`);
      const data = await response.json();
      console.log('Navbar: Teacher check response:', data);
      
      if (data.status === 'success' && data.is_teacher) {
        console.log('Navbar: User confirmed as teacher, updating state');
        setIsTeacher(true);
        // Also set user_type in localStorage for consistency
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('currentUser');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userData.user_type = 'teacher';
            localStorage.setItem('currentUser', JSON.stringify(userData));
            setCurrentUser(userData);
            console.log('Navbar: Updated localStorage with user_type=teacher');
          }
        }
      } else {
        console.log('Navbar: User is not a teacher');
        setIsTeacher(false);
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
    }
  };

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // If no search handler provided, navigate to home with search query
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/my-posts', label: 'My Posts' },
    { href: '/profile', label: 'Profile' },
    { href: '/new-post', label: 'New Post' },
    { href: '/category', label: 'Categories' },
    ...(isTeacher ? [
      { href: '/classes', label: 'Classes' },
      { href: '/search-student', label: 'Search Student' }
    ] : []),
  ];

  return (
    <>
      {/* Top Search Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b-2 border-blue-600 z-40" 
           style={{ 
             backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
             paddingLeft: isCollapsed ? '4rem' : '16rem'
           }}>
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-4 flex-1 justify-center">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads by title or content..."
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-xl border-r-2 border-blue-600 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`} style={{ 
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}>
        {/* Logo/Title */}
        {!isCollapsed && (
          <div className="px-4 py-6 border-b border-blue-200">
            <h1 className="text-xl font-bold text-blue-700">KIS Jeju Forum</h1>
          </div>
        )}
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? 'top-4' : 'top-20'} -right-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors`}
        >
          <svg 
            className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation Items */}
        <nav className={`${isCollapsed ? 'mt-16' : 'mt-8'} px-2`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            if (isCollapsed) {
              // When collapsed, render non-clickable divs
              return (
                <div
                  key={item.href}
                  className={`flex items-center gap-3 px-3 py-3 my-1 rounded-lg transition-all duration-200 cursor-default ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl min-w-[1.5rem] text-center"></span>
                </div>
              );
            }
            
            // When expanded, render clickable Links
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 my-1 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="text-xl min-w-[1.5rem] text-center"></span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {!isCollapsed && currentUser && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div
              className={`bg-blue-50 rounded-lg p-3 border border-blue-200 cursor-pointer transition-all duration-300 hover:bg-blue-100 hover:border-blue-300 hover:shadow-lg ${isTeacher ? 'hover:shadow-red-200/70' : 'hover:shadow-blue-200/50'}`}
              onClick={() => router.push('/profile')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${isTeacher ? 'bg-red-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 ${isTeacher ? 'hover:bg-red-700' : 'hover:bg-blue-700'} hover:shadow-md`}>
                  {(currentUser?.given_name || currentUser?.firstName || currentUser?.name || currentUser?.user_id || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isTeacher ? 'text-red-700' : 'text-blue-700'} truncate`}>
                    {currentUser?.given_name && currentUser?.surname 
                      ? `${currentUser.given_name} ${currentUser.surname}`
                      : currentUser?.firstName && currentUser?.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser?.name
                      ? currentUser.name
                      : currentUser?.user_id 
                      ? currentUser.user_id
                      : currentUser?.username
                      ? currentUser.username
                      : 'User'
                    }
                  </p>
                  <p className={`text-xs ${isTeacher ? 'text-red-600 font-bold' : 'text-blue-600'}`} key={isTeacher ? 'teacher' : 'student'}>
                    {isTeacher ? 'Teacher' : 'Student'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
