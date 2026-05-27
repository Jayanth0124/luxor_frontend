'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment } from '@/services/blog.service';

export default function CommentForm({ blogId, parentId = null, onSuccess, user, isAuth }) {
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isLoading: isPending, isError } = useMutation({
    mutationFn: (data) => postComment(blogId, data),
    onSuccess: () => {
      setContent('');
      setSubmitted(true);
      queryClient.invalidateQueries(['blog-comments', blogId]);
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = () => {
    mutate({
      content,
      parentId,
      guestName: isAuth ? undefined : guestName,
      guestEmail: isAuth ? undefined : guestEmail || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="bg-[#84cc16]/10 border border-[#84cc16]/30 rounded-xl p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-[11px] text-gray-900 font-mono uppercase tracking-widest">
          Review submitted. Awaiting moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isAuth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-[9px] font-mono text-gray-400 uppercase tracking-widest">NAME</span>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="YOUR NAME"
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-[#84cc16] focus:bg-white transition-all placeholder:text-gray-400 tracking-widest"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-[9px] font-mono text-gray-400 uppercase tracking-widest">EMAIL</span>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="EMAIL ADDRESS (OPTIONAL)"
              className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-[#84cc16] focus:bg-white transition-all placeholder:text-gray-400 tracking-widest"
            />
          </div>
        </div>
      )}
      
      <div className="relative">
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'WRITE A REPLY...' : 'SHARE YOUR THOUGHTS...'}
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-sans text-gray-900 focus:outline-none focus:border-[#84cc16] focus:bg-white transition-all placeholder:text-gray-400 resize-none"
        />
        <div className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-400 uppercase tracking-widest pointer-events-none">
          {content.length}/500 CHARS
        </div>
      </div>

      {isError && <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Failed to submit. Please try again.</p>}
      
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || (!isAuth && !guestName.trim()) || isPending}
        className="group relative w-full sm:w-auto bg-[#84cc16] hover:bg-[#84cc16]/90 disabled:opacity-50 text-gray-900 font-black text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl transition-all overflow-hidden flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(132,204,22,0.2)]"
      >
        <span className="relative z-10">{isPending ? 'SUBMITTING...' : parentId ? 'POST REPLY' : 'POST REVIEW'}</span>
        {!isPending && (
          <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        )}
      </button>
    </div>
  );
}
