'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeComment } from '@/services/blog.service';
import CommentForm from './CommentForm';

export default function Comment({ comment, blogId, user, isAuth }) {
  const qc = useQueryClient();
  const [showReply, setShowReply] = useState(false);

  const likeMut = useMutation({
    mutationFn: () => likeComment(comment._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-comments', blogId] }),
  });

  const displayName = comment.user?.name || comment.guestName || 'Anonymous';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] font-bold text-sm shrink-0">
          {displayName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">{displayName}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1.5 px-1">
            <button
              onClick={() => likeMut.mutate()}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#84cc16] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25M9 21H5.25a2.25 2.25 0 01-2.25-2.25V10.5a2.25 2.25 0 012.25-2.25H9" />
              </svg>
              {comment.likes > 0 ? comment.likes : ''} Like
            </button>
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-xs text-gray-400 hover:text-[#84cc16] transition-colors"
            >
              Reply
            </button>
          </div>

          {showReply && (
            <div className="mt-3 pl-2">
              <CommentForm
                blogId={blogId}
                parentId={comment._id}
                onSuccess={() => setShowReply(false)}
                user={user}
                isAuth={isAuth}
              />
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                    {(reply.user?.name || reply.guestName || 'A')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{reply.user?.name || reply.guestName || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
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
