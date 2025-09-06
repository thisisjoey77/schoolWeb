"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getPendingContent, validatePost, blockPost } from '../api/posts';
import { validateReply, blockReply } from '../api/replies';

interface PendingPost { post_id:number; title:string; content:string; author_id:string; upload_time:string; anonymous:number; category:string; validated:number; }
interface PendingReply { reply_id:number; parent_post_id:number; content:string; author_id:string; upload_time:string; anonymous:number; validated:number; }

export default function PendingPostsPage(){
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [posts,setPosts]=useState<PendingPost[]>([]);
  const [replies,setReplies]=useState<PendingReply[]>([]);
  const [error,setError]=useState<string>('');

  useEffect(()=>{
    if(typeof window!=="undefined"){
      const userStr=localStorage.getItem('currentUser');
      if(userStr){ try { setCurrentUser(JSON.parse(userStr)); } catch { setCurrentUser(null);} }
    }
  },[]);

  useEffect(()=>{ if(!currentUser) return; loadPending(); },[currentUser]);

  const loadPending = async ()=>{
    if(!currentUser?.school_id){ setError('Missing school id'); return; }
    setLoading(true); setError('');
    try {
      const res:any = await getPendingContent(currentUser.school_id);
      if(res.status==='success'){
        setPosts(res.posts||[]); setReplies(res.replies||[]);
      } else { setError(res.message||'Failed to load'); }
    } catch(e:any){ setError(e.message||'Failed to load'); }
    finally { setLoading(false); }
  };

  const handleValidatePost = async (postId:number)=>{
    if(!currentUser?.school_id) return;
    const res:any = await validatePost(postId,currentUser.school_id);
    if(res.status==='success'){ await loadPending(); } else { alert(res.message||'Failed to validate post'); }
  };
  const handleBlockPost = async (postId:number)=>{
    if(!currentUser?.school_id) return;
    const res:any = await blockPost(postId,currentUser.school_id);
    if(res.status==='success'){ await loadPending(); } else { alert(res.message||'Failed to block post'); }
  };
  const handleValidateReply = async (replyId:number)=>{
    if(!currentUser?.school_id) return;
    const res:any = await validateReply(replyId,currentUser.school_id);
    if(res.status==='success'){ await loadPending(); } else { alert(res.message||'Failed to validate reply'); }
  };
  const handleBlockReply = async (replyId:number)=>{
    if(!currentUser?.school_id) return;
    const res:any = await blockReply(replyId,currentUser.school_id);
    if(res.status==='success'){ await loadPending(); } else { alert(res.message||'Failed to block reply'); }
  };

  const getAuthorDisplay = (anon:number, author:string)=> anon ? author + ' (Anon)' : author;

  if(currentUser && !currentUser.is_admin){
    return <div className='min-h-screen bg-gray-50'><Navbar/><div className='pl-64 pt-20 p-6 text-red-600 font-semibold'>Access denied: Admin only.</div></div>;
  }

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-transparent to-yellow-500'></div>
      </div>
      <Navbar />
      <div className='pl-16 md:pl-64 pt-20 relative z-10'>
        <main className='max-w-5xl mx-auto p-6'>
          <h1 className='text-3xl font-bold text-green-700 mb-6'>Pending Content</h1>
          {loading && <div className='bg-white p-6 rounded shadow border text-blue-600'>Loading...</div>}
          {error && <div className='bg-white p-4 mb-4 rounded border border-red-300 text-red-600'>{error}</div>}

          {!loading && !error && (
            <div className='space-y-10'>
              <section>
                <h2 className='text-2xl font-semibold text-blue-700 mb-4'>Posts Awaiting Validation ({posts.length})</h2>
                {posts.length===0 && <div className='bg-white p-4 rounded border text-gray-500'>No pending posts.</div>}
                <div className='space-y-4'>
                  {posts.map(p=> (
                    <div key={p.post_id} className='bg-white p-5 rounded border shadow-sm hover:shadow-md transition'>
                      <div className='flex justify-between items-start mb-2'>
                        <h3 className='text-xl font-bold text-blue-700'>{p.title}</h3>
                        <span className='text-xs text-gray-500'>{new Date(p.upload_time).toLocaleString()}</span>
                      </div>
                      <div className='text-sm text-gray-600 mb-2'>By <span className='font-semibold text-blue-600'>{getAuthorDisplay(p.anonymous,p.author_id)}</span> • <span className='text-yellow-700'>{p.category}</span></div>
                      <p className='text-gray-700 whitespace-pre-wrap mb-4 line-clamp-6'>{p.content}</p>
                      <div className='flex gap-3'>
                        <button onClick={()=>handleValidatePost(p.post_id)} className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold'>Validate</button>
                        <button onClick={()=>handleBlockPost(p.post_id)} className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold'>Block</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className='text-2xl font-semibold text-blue-700 mb-4'>Replies Awaiting Validation ({replies.length})</h2>
                {replies.length===0 && <div className='bg-white p-4 rounded border text-gray-500'>No pending replies.</div>}
                <div className='space-y-4'>
                  {replies.map(r=> (
                    <div key={r.reply_id} className='bg-white p-4 rounded border shadow-sm hover:shadow-md transition'>
                      <div className='flex justify-between items-start mb-1'>
                        <span className='text-sm text-gray-600'>On Post #{r.parent_post_id}</span>
                        <span className='text-xs text-gray-500'>{new Date(r.upload_time).toLocaleString()}</span>
                      </div>
                      <div className='text-sm text-gray-600 mb-2'>By <span className='font-semibold text-blue-600'>{getAuthorDisplay(r.anonymous,r.author_id)}</span></div>
                      <p className='text-gray-700 whitespace-pre-wrap mb-3'>{r.content}</p>
                      <div className='flex gap-3'>
                        <button onClick={()=>handleValidateReply(r.reply_id)} className='bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-semibold'>Validate</button>
                        <button onClick={()=>handleBlockReply(r.reply_id)} className='bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-semibold'>Block</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
