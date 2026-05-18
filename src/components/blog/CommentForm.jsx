'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment } from '@/services/blog.service';

export default function CommentForm({ blogId, parentId = null, onSuccess, user, isAuth }) {
  const qc = useQueryClient();
  const [content,    setContent]    = useState('');
  const [guestName,  setGuestName]  = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitted,  setSubmitted]  = useState(false);

  const mut = useMutation({
    mutationFn: () => postComment(blogId, {
      content,
      guestName:  isAuth ? undefined : guestName,
      guestEmail: isAuth ? undefined : guestEmail,
      parentComment: parentId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-comments', blogId] });
      setContent('');
      setSubmitted(true);
      if (onSuccess) onSuccess();
    },
  });

  if (submitted) {
    return (
      <p className="text-sm text-green-600 font-medium py-3">
        Comment submitted! It will appear after moderation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!isAuth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name *"
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition"
          />
        </div>
      )}
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : 'Share your thoughts…'}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition resize-none"
      />
      {mut.isError && <p className="text-xs text-red-500">Failed to submit. Please try again.</p>}
      <button
        onClick={() => mut.mutate()}
        disabled={!content.trim() || (!isAuth && !guestName.trim()) || mut.isPending}
        className="bg-[#84cc16] hover:bg-[#78b715] disabled:opacity-50 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition"
      >
        {mut.isPending ? 'Posting…' : parentId ? 'Post Reply' : 'Post Comment'}
      </button>
    </div>
  );
}
