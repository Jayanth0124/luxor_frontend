'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CommentForm from './CommentForm';
import { likeComment } from '@/services/blog.service';

export default function Comment({ comment, blogId, user, isAuth }) {
  const [showReply, setShowReply] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: handleLike } = useMutation({
    mutationFn: () => likeComment(comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-comments', blogId]);
    },
  });

  const displayName = comment.user?.name || comment.guestName || 'ANONYMOUS';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Avatar Radar Ping */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#84cc16]/10 border border-[#84cc16]/30 rounded-full" />
          <div className="absolute inset-0 bg-[#84cc16]/20 rounded-full animate-ping opacity-40" />
          <span className="relative z-10 text-[#84cc16] font-black text-xs uppercase">
            {displayName[0]?.toUpperCase()}
          </span>
        </div>

        {/* Comment Box */}
        <div className="flex-1">
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full blur-2xl -z-10" />
            <div className="flex flex-wrap items-center gap-3 mb-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{displayName}</span>
              <span className="w-4 h-[1px] bg-gray-200" />
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                POSTED ON {new Date(comment.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium relative z-10">{comment.content}</p>
          </div>
          
          {/* Action Row */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <button
              onClick={() => handleLike()}
              className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 uppercase tracking-widest hover:text-[#84cc16] transition-colors group"
            >
              <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              LIKE {comment.likes > 0 ? `[${comment.likes}]` : ''}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-[9px] font-mono text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              REPLY
            </button>
          </div>

          {/* Reply form */}
          {showReply && (
            <div className="mt-4 pl-4 border-l-2 border-gray-100">
              <CommentForm
                blogId={blogId}
                parentId={comment._id}
                onSuccess={() => setShowReply(false)}
                user={user}
                isAuth={isAuth}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 pl-6 border-l border-dashed border-gray-200 space-y-4 relative">
              {/* Connector line for nested replies */}
              <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-gray-200 to-transparent" />
              
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex items-start gap-3 relative">
                  <div className="absolute top-4 -left-6 w-4 h-px bg-gray-200" />
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 font-black text-[10px] shrink-0 uppercase shadow-sm">
                    {(reply.user?.name || reply.guestName || 'A')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-800">{reply.user?.name || reply.guestName || 'ANONYMOUS'}</span>
                      <span className="text-[8px] font-mono text-gray-500">{new Date(reply.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
