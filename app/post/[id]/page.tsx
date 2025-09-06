"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { PostWithReplies } from "../../types";
import { getPostById } from "../../centralData";
import { getPostReplies, postReply } from "../../api/replies";
import { getPost, blockPost, validatePost } from "../../api/posts";
// Removed import of currentUser; will load from localStorage

function getAuthorDisplay(isAnonymous: boolean | number, authorId: string, isAdminView: boolean) {
  const anonymous = typeof isAnonymous === 'number' ? isAnonymous === 1 : isAnonymous;
  if (!anonymous) return authorId;
  return isAdminView ? `${authorId} (Anon)` : 'Anonymous';
}


export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id ? Number(params.id) : 0;


  // Synchronously read user from localStorage on first render
  let initialUser = null;
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        initialUser = JSON.parse(userStr);
      } catch (e) {
        initialUser = null;
      }
    }
  }
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [post, setPost] = useState<PostWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showAnonymousPopup, setShowAnonymousPopup] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [blockingPost, setBlockingPost] = useState(false);
  const [validatingPost, setValidatingPost] = useState(false);

  // Check if user is a teacher using localStorage data
  useEffect(() => {
    setTeacherLoading(true);
    if (currentUser) {
      if (currentUser.is_teacher !== undefined) {
        setIsTeacher(currentUser.is_teacher === true);
      } else {
        setIsTeacher(false);
      }
      if (currentUser.is_admin || currentUser.user_type === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsTeacher(false);
      setIsAdmin(false);
    }
    setTeacherLoading(false);
  }, [currentUser]);

  // Load post and replies from API
  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        // Try to get post from API first
        try {
          const requesterSchoolId = currentUser?.school_id || null;
          const postResponse: any = await getPost(postId, requesterSchoolId);
          if (postResponse.status === 'success') {
            // Successfully got post from API, now get replies
            try {
              const repliesResponse: any = await getPostReplies(postId, requesterSchoolId);
              if (repliesResponse.status === 'success') {
                setPost({
                  ...postResponse.post,
                  replies: repliesResponse.replies || []
                });
              } else {
                // Got post but not replies, use post without replies
                setPost({
                  ...postResponse.post,
                  replies: []
                });
              }
            } catch (repliesError) {
              console.error('Failed to load replies from API:', repliesError);
              // Got post but not replies, use post without replies
              setPost({
                ...postResponse.post,
                replies: []
              });
            }
          } else {
            throw new Error(postResponse.message || 'Post not found');
          }
        } catch (postError) {
          console.error('Failed to load post from API:', postError);
          // Fall back to local data
          const localPost = getPostById(postId);
          if (!localPost) {
            setPost(null);
            return;
          }
          // Try to fetch replies from API for local post
          try {
            const repliesResponse: any = await getPostReplies(postId);
            if (repliesResponse.status === 'success') {
              setPost({
                ...localPost,
                replies: repliesResponse.replies || []
              });
            } else {
              // Fall back to local data
              setPost(localPost);
            }
          } catch (error) {
            console.error('Failed to load replies from API:', error);
            // Fall back to local data
            setPost(localPost);
          }
        }
      } catch (error) {
        console.error('Error loading post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    if (postId) {
      loadPost();
    }
  }, [postId, currentUser]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('Please enter a reply.');
      return;
    }
    
    setSubmittingReply(true);
    
    if (!currentUser || !currentUser.user_id) {
      alert('User not found. Please log in again.');
      return;
    }
    try {
      const response: any = await postReply({
        uploadTime: new Date().toISOString(),
        parentPostId: postId,
        content: replyContent.trim(),
        authorId: currentUser.user_id,
        anonymous: isAnonymous ? 1 : 0
      });
      
      if (response.status === 'success') {
        // Reload replies
        const repliesResponse: any = await getPostReplies(postId);
        if (repliesResponse.status === 'success' && post) {
          setPost({
            ...post,
            replies: repliesResponse.replies || []
          });
        }
        
        // Reset form
        setReplyContent('');
        setIsAnonymous(false);
        alert('Reply posted successfully!');
      } else {
        throw new Error(response.message || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply: ' + error);
    } finally {
      setSubmittingReply(false);
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

  const handleBlockPost = async () => {
  if (!currentUser || !(isTeacher || isAdmin) || !post) return;
    
    const confirmBlock = window.confirm('Are you sure you want to block this post? This will set its validation status to 0.');
    if (!confirmBlock) return;
    
    setBlockingPost(true);
    try {
      const response: any = await blockPost(post.post_id, currentUser.school_id);
      if (response.status === 'success') {
        // Reload the post to show updated status
        const requesterSchoolId = currentUser?.school_id || null;
        const postResponse: any = await getPost(postId, requesterSchoolId);
        if (postResponse.status === 'success') {
          // Get replies too
          const repliesResponse: any = await getPostReplies(postId, requesterSchoolId);
          setPost({
            ...postResponse.post,
            replies: repliesResponse.status === 'success' ? repliesResponse.replies || [] : []
          });
        }
        alert('Post blocked successfully');
      } else {
        alert(response.message || 'Failed to block post');
      }
    } catch (error) {
      console.error('Error blocking post:', error);
      alert('Failed to block post. Please try again.');
    } finally {
      setBlockingPost(false);
    }
  };

  const handleValidatePost = async () => {
  if (!currentUser || !(isTeacher || isAdmin) || !post) return;
    
    const confirmValidate = window.confirm('Are you sure you want to validate this post? This will make it visible to all students.');
    if (!confirmValidate) return;
    
    setValidatingPost(true);
    try {
      const response: any = await validatePost(post.post_id, currentUser.school_id);
      if (response.status === 'success') {
        // Reload the post to show updated status
        const requesterSchoolId = currentUser?.school_id || null;
        const postResponse: any = await getPost(postId, requesterSchoolId);
        if (postResponse.status === 'success') {
          // Get replies too
          const repliesResponse: any = await getPostReplies(postId, requesterSchoolId);
          setPost({
            ...postResponse.post,
            replies: repliesResponse.status === 'success' ? repliesResponse.replies || [] : []
          });
        }
        alert('Post validated successfully');
      } else {
        alert(response.message || 'Failed to validate post');
      }
    } catch (error) {
      console.error('Error validating post:', error);
      alert('Failed to validate post. Please try again.');
    } finally {
      setValidatingPost(false);
    }
  };

  if (loading || teacherLoading) {
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
            <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
              <div className="text-blue-600 text-xl">Loading post...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                {post.anonymous === 1 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium">
                    Anonymous
                  </span>
                )}
                {post.validated === 0 && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                    Pending Validation
                  </span>
                )}
              </div>
              
              {/* Teacher Block Button */}
              {(isTeacher || isAdmin) && post.validated === 1 && (
                <button
                  onClick={handleBlockPost}
                  disabled={blockingPost}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {blockingPost && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  )}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  {blockingPost ? 'Blocking...' : 'Block'}
                </button>
              )}
              
              {/* Teacher Validate Button - new button for validating posts */}
              {(isTeacher || isAdmin) && post.validated === 0 && (
                <button
                  onClick={handleValidatePost}
                  disabled={validatingPost}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {validatingPost && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  )}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {validatingPost ? 'Validating...' : 'Validate'}
                </button>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-blue-700 mb-4">{post.title}</h1>
            
            <div className="text-gray-600 mb-4">
              by <span className="text-blue-600 font-semibold">
                {getAuthorDisplay(post.anonymous, post.author_id, isAdmin)}
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
                <p className="text-gray-500 mb-6">No replies yet. Be the first to reply!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {post.replies.map((reply) => (
                    <div key={reply.reply_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-gray-600 text-sm mb-2">
                        <span className="text-blue-600 font-semibold">
                          {getAuthorDisplay(reply.anonymous, reply.author_id, isAdmin)}
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

              {/* Reply Form - Now at the bottom */}
              <form onSubmit={handleReplySubmit} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Add a Reply</h3>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="w-full bg-white text-gray-700 p-3 rounded border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm mb-3"
                  required
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="reply-anonymous"
                      checked={isAnonymous}
                      onChange={(e) => handleAnonymousToggle(e.target.checked)}
                      className="mr-2 accent-yellow-500"
                    />
                    <label htmlFor="reply-anonymous" className="text-gray-700 font-semibold">
                      Reply anonymously
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className={`font-bold py-2 px-4 rounded transition-colors shadow-lg ${
                      submittingReply 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : 'bg-blue-600 hover:bg-yellow-500 text-white'
                    }`}
                  >
                    {submittingReply ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Anonymous Reply Popup Modal */}
          {showAnonymousPopup && (
            <div className="fixed inset-0 backdrop-blur-sm bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg max-w-lg w-full mx-auto border-2 border-blue-600 shadow-2xl transform transition-all">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-blue-700 mb-6">Anonymous Reply Notice</h2>
                  <p className="text-gray-700 mb-4 text-left">
                    While your reply will appear anonymous to other students, your identity will be disclosed to teachers and administrators for safety and monitoring purposes.
                  </p>
                  <p className="text-gray-600 mb-8 text-sm text-left">
                    By replying anonymously, you acknowledge that your identity remains traceable by school staff.
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
