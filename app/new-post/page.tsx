"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { allPosts } from '../centralData';
import { isEnglishOnlyText } from '../utils/languageValidation';
// Removed import of currentUser; will load from localStorage
// Import API function
import { postUpload } from '../api/posts.js';

const categories = [
  "General",
  "Dorm",
  "AP Calculus AB", 
  "AP Calculus BC",
  "Algebra 1",
  "Algebra 2", 
  "Geometry",
  "Pre-Calculus",
  "Statistics",
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
  "AP Environmental Science",
  "English 9",
  "English 10", 
  "English 11",
  "English 12",
  "AP English Language",
  "AP English Literature",
  "World History",
  "US History",
  "AP World History",
  "AP US History",
  "AP European History",
  "Government",
  "AP Government",
  "Economics",
  "AP Economics",
  "Spanish 1",
  "Spanish 2",
  "Spanish 3",
  "AP Spanish",
  "French 1",
  "French 2", 
  "French 3",
  "AP French",
  "Computer Science",
  "AP Computer Science A",
  "AP Computer Science Principles",
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
];

export default function NewPost() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <NewPostContent />
    </Suspense>
  );
}


function NewPostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preSelectedCategory = searchParams.get('category');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(preSelectedCategory || categories[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAnonymousPopup, setShowAnonymousPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (preSelectedCategory && categories.includes(preSelectedCategory)) {
      setCategory(preSelectedCategory);
    }
  }, [preSelectedCategory]);

  // Load current user from localStorage
  useEffect(() => {
	if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
	const userStr = window.localStorage.getItem('currentUser');
	if (userStr) {
	  try {
		setCurrentUser(JSON.parse(userStr));
	  } catch (e) {
		setCurrentUser(null);
	  }
	}
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    // Language validation: only allow English, symbols, and emojis
    if (!isEnglishOnlyText(title) || !isEnglishOnlyText(content)) {
      alert('Posts must be written in English only. Please remove any non-English characters (e.g., Korean, Japanese, Chinese).');
      return;
    }
    if (!currentUser || !currentUser.user_id) {
      alert('User not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to the database via API
      const apiResponse = await postUpload({
        uploadTime: new Date().toISOString(),
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.user_id,
        anonymous: isAnonymous ? 1 : 0,
        category: category
      }) as any;

      if (apiResponse.status === 'success') {
        alert('Post created successfully!');
        router.push('/');
      } else {
        throw new Error(apiResponse.message || 'Failed to create post');
      }

    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to create post: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousToggle = (checked: boolean) => {
    if (checked) {
      setShowAnonymousPopup(true);
    } else {
      setIsAnonymous(false);
    }
  };

  const acceptAnonymousTerms = () => {
    setIsAnonymous(true);
    setShowAnonymousPopup(false);
  };

  const declineAnonymousTerms = () => {
    setIsAnonymous(false);
    setShowAnonymousPopup(false);
  };

  // If user is not loaded, show nothing (or a loading state)
  if (currentUser === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading user...</div>;
  }
  if (!currentUser || !currentUser.user_id) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in.</div>;
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
        <main className="max-w-3xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-6 text-blue-700">Create New Post</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full bg-white text-gray-700 p-3 rounded border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={8}
                className="w-full bg-white text-gray-700 p-3 rounded border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white text-blue-700 font-bold p-3 rounded border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white text-blue-700">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => handleAnonymousToggle(e.target.checked)}
                className="mr-2 accent-yellow-500"
              />
              <label htmlFor="anonymous" className="text-gray-700 font-semibold">
                Post anonymously
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`font-bold py-3 px-6 rounded transition-colors shadow-lg ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                    : 'bg-blue-600 hover:bg-yellow-500 text-white'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Anonymous Popup Modal */}
          {showAnonymousPopup && (
            <div className="fixed inset-0 backdrop-blur-sm bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg max-w-lg w-full mx-auto border-2 border-blue-600 shadow-2xl transform transition-all">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-blue-700 mb-6">Anonymous Posting Notice</h2>
                  <p className="text-gray-700 mb-4 text-left">
                    While your post will appear anonymous to other students, your identity will be disclosed to teachers and administrators for safety and monitoring purposes.
                  </p>
                  <p className="text-gray-600 mb-8 text-sm text-left">
                    By posting anonymously, you acknowledge that your identity remains traceable by school staff.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={acceptAnonymousTerms}
                      className="bg-blue-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg"
                    >
                      I Accept
                    </button>
                    <button
                      onClick={declineAnonymousTerms}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors shadow-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
