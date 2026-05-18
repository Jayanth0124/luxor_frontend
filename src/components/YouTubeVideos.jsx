'use client';

import { useState } from 'react';

function VideoCard({ videoId }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group"
      aria-label="Play video"
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Video thumbnail"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
      {/* Play button */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-gray-900 ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}

export default function YouTubeVideos({ videoIds = [] }) {
  if (!videoIds?.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Video{videoIds.length > 1 ? 's' : ''}
      </h2>
      <div className={`grid gap-4 ${videoIds.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {videoIds.map((id) => (
          <VideoCard key={id} videoId={id} />
        ))}
      </div>
    </div>
  );
}
