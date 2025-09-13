"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

type IconName =
  | 'home'
  | 'myPosts'
  | 'profile'
  | 'newPost'
  | 'categories'
  | 'classes'
  | 'searchStudent'
  | 'pendingPosts';

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  // Minimal, unified outline icons (24x24), inherit color from parent
  switch (name) {
    case 'home':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9.5z" />
        </svg>
      );
    case 'myPosts':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" ry="2" />
          <path strokeLinecap="round" d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case 'profile':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'newPost':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 8v8M8 12h8" />
        </svg>
      );
    case 'categories':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'classes':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5v4.5a5 5 0 0 0 10 0v-4.5" />
        </svg>
      );
    case 'searchStudent':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10" cy="10" r="5" />
          <path strokeLinecap="round" d="M21 21l-5.2-5.2" />
        </svg>
      );
    case 'pendingPosts':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l2 4v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7l2-4z" />
          <path strokeLinecap="round" d="M12 8v5l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  // IMPORTANT: Keep initial state stable across SSR and first client render to avoid hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  // Page title helper for tab name
  const routeTitles: Record<string, string> = {
    '/': 'Home',
    '/my-posts': 'My Posts',
    '/profile': 'Profile',
    '/new-post': 'New Post',
    '/category': 'Categories',
    '/classes': 'Classes',
    '/search-student': 'Search Student',
    '/pending-posts': 'Pending Posts',
    '/login': 'Login',
    '/signup': 'Sign Up',
  };

  function computePageTitle(path: string) {
    if (path.startsWith('/post/')) return 'Post';
    if (path.startsWith('/student-profile/')) return 'Student Profile';
    return routeTitles[path] ?? 'Dragon\'s Den';
  }

  // Update browser tab title on route changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = computePageTitle(pathname);
    }
  }, [pathname]);

  console.log('Navbar: Current isTeacher state:', isTeacher);

  // Load user info from localStorage
  useEffect(() => {
  setHasMounted(true);
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
        // Admin flag only trusted if explicitly set during admin login
        if (userData.is_admin === true || userData.user_type === 'admin') {
          setIsAdmin(true);
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

  // After mount, load the persisted sidebar state and respect small screens
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      } else if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    } catch {}
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

  // NOTE: Removed automatic admin probing because teachers also have access to pending-content.
  // Admin status now only comes from explicit admin login response (userData.is_admin).

  // On small screens always force collapsed (don't auto-expand on wider screens)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist user preference whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
    } catch {}
  }, [isCollapsed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // If no search handler provided, navigate to home with search query
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems: Array<{ href: string; label: string; icon: IconName }> = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/my-posts', label: 'My Posts', icon: 'myPosts' },
    { href: '/profile', label: 'Profile', icon: 'profile' },
    { href: '/new-post', label: 'New Post', icon: 'newPost' },
    { href: '/category', label: 'Categories', icon: 'categories' },
    ...((isTeacher) ? [ { href: '/classes', label: 'Classes', icon: 'classes' as const } ] : []),
    ...((isTeacher || isAdmin) ? [ { href: '/search-student', label: 'Search Student', icon: 'searchStudent' as const } ] : []),
    ...(isAdmin ? [ { href: '/pending-posts', label: 'Pending Posts', icon: 'pendingPosts' as const } ] : []),
  ];

  // Role color helpers (explicit class strings to satisfy Tailwind JIT) 
  const roleActiveClasses = isAdmin
    ? 'bg-green-100 text-green-700 border-r-4 border-green-600'
    : isTeacher
    ? 'bg-red-100 text-red-700 border-r-4 border-red-600'
    : 'bg-blue-100 text-blue-700 border-r-4 border-blue-600';
  const roleHoverClasses = isAdmin
    ? 'text-gray-700 hover:bg-green-50 hover:text-green-700'
    : isTeacher
    ? 'text-gray-700 hover:bg-red-50 hover:text-red-700'
    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';
  const roleCollapsedActive = isAdmin
    ? 'bg-green-100 text-green-700 border-r-4 border-green-600'
    : isTeacher
    ? 'bg-red-100 text-red-700 border-r-4 border-red-600'
    : 'bg-blue-100 text-blue-700 border-r-4 border-blue-600';
  // Collapsed active style (more generous highlight with ring, not a tight right-border)
  const roleCollapsedActiveClasses = isAdmin
    ? 'bg-green-100 text-green-700 ring-2 ring-green-500/40'
    : isTeacher
    ? 'bg-red-100 text-red-700 ring-2 ring-red-500/40'
    : 'bg-blue-100 text-blue-700 ring-2 ring-blue-500/40';
  const userCardBase = isAdmin
    ? 'bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300'
    : isTeacher
    ? 'bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300'
    : 'bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300';
  const userAvatarBg = isAdmin ? 'bg-green-600 hover:bg-green-700' : isTeacher ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
  const userNameColor = isAdmin ? 'text-green-700' : isTeacher ? 'text-red-700' : 'text-blue-700';
  const userRoleColor = isAdmin ? 'text-green-600 font-bold' : isTeacher ? 'text-red-600 font-bold' : 'text-blue-600';

  return (
    <>
      {/* Top Search Bar */}
  <div className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b-2 border-blue-600 z-40" 
           style={{ 
     backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
     paddingLeft: isCollapsed ? '5rem' : '16rem'
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
        isCollapsed ? 'w-20' : 'w-64'
      }`} style={{ 
        backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}>
        {/* Logo/Title */}
        {!isCollapsed && (
          <div className="px-4 py-6 border-b border-blue-200">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-md overflow-hidden ring-1 ring-blue-200 group-hover:ring-blue-300 transition flex items-center justify-center bg-slate-50">
                {logoError ? (
                  // Fallback to native img if next/image fails
                  <img src="/LOGO.png" alt="Dragon's Den" width={28} height={28} style={{ objectFit: 'contain' }} />
                ) : (
                  <Image
                    src="/LOGO.png"
                    alt="Dragon's Den"
                    width={28}
                    height={28}
                    priority
                    onError={() => setLogoError(true)}
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
              <h1 className="text-xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">Dragon's Den</h1>
            </Link>
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
              // Collapsed: clickable icon-only links
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={`flex items-center justify-center mx-2 my-1 rounded-xl p-3.5 w-12 h-12 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    isActive ? roleCollapsedActiveClasses : 'text-gray-700 hover:bg-gray-100 hover:ring-1 hover:ring-gray-300'
                  }`}
                >
      <Icon name={item.icon} className="h-6 w-6 min-w-[1.5rem]" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            }
            
            // When expanded, render clickable Links
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 my-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? roleActiveClasses 
                    : roleHoverClasses
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 min-w-[1.25rem]" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {!isCollapsed && currentUser && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div
              className={`${userCardBase} rounded-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-lg ${isAdmin ? 'hover:shadow-green-200/70' : isTeacher ? 'hover:shadow-red-200/70' : 'hover:shadow-blue-200/50'}`}
              onClick={() => router.push('/profile')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${userAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300 hover:shadow-md`}>
                  {(currentUser?.given_name || currentUser?.firstName || currentUser?.name || currentUser?.user_id || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${userNameColor} truncate`}>
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
                  <p className={`text-xs ${userRoleColor}`} key={isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student'}>
                    {isAdmin ? 'Admin' : isTeacher ? 'Teacher' : 'Student'}
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
