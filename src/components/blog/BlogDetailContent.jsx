'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import CommentForm from './CommentForm';
import Comment from './Comment';

const DUMMY_POSTS = {
  'himalayan-ascent': {
    _id: '1',
    title: 'The Himalayan Ascent',
    subtitle: 'A Journey Beyond the Clouds',
    content: `
      <p class="drop-cap">The air grows thin, but the engine roars louder. We pushed our luxury SUVs to their limits traversing the treacherous Spiti Valley roads, discovering untamed beauty at 14,000 feet. Every turn on this ancient trade route felt like a battle against gravity itself.</p>
      
      <div class="cinematic-quote">
        "You don't conquer the Himalayas. You simply survive them long enough to witness their absolute magnificence."
      </div>
      
      <h3 id="chapter-1">Chapter 01: The Departure</h3>
      <p>Starting from Manali, the climb is steep and unforgiving. By the time we hit Rohtang Pass, the terrain had completely shifted from lush green forests to stark, barren mountain scapes.</p>
      
      <img src="https://images.unsplash.com/photo-1522362375549-335b1c5c5678?q=80&w=2000&auto=format&fit=crop" class="editorial-image" alt="Mountain Pass" />
      <span class="image-caption">FIG 1.1 — The convoy ascending Rohtang Pass at 0600 Hours.</span>
      
      <h3 id="chapter-2">Chapter 02: The Glacial Crossings</h3>
      <p>Our customized off-road suspensions handled the rocky glacial melts with ease, proving once again that true luxury isn't just about the interior leather—it's about the capability to take that comfort anywhere.</p>
      <p>As the temperature dropped below freezing, the thermal cabin insulation kept the crew entirely isolated from the brutal elements outside. We were effectively piloting a five-star hotel room through a blizzard.</p>

      <div class="telemetry-box">
        <h4>Expedition Telemetry</h4>
        <ul>
          <li><strong>Altitude Reached:</strong> 14,200 ft</li>
          <li><strong>External Temp:</strong> -12°C</li>
          <li><strong>Terrain Type:</strong> Black Ice / Loose Shale</li>
          <li><strong>Vehicle Status:</strong> Nominal</li>
        </ul>
      </div>

      <h3 id="chapter-3">Chapter 03: The Descent</h3>
      <p>Coming down is always harder than going up. The brakes glowed dull red in the fading twilight as we navigated the hairpin bends back towards civilization. We left a piece of ourselves up there, in the quiet, frozen void.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Luxor Team',
    publishedAt: '2023-10-15T00:00:00.000Z',
    readTime: 12,
    category: 'Expedition',
    type: 'blog',
    tags: ['Mountains', 'Off-Road', 'Himalayas'],
    views: 1240,
    director: 'Michael Vance',
    producer: 'Sarah Jenkins',
    location: 'Spiti Valley, India'
  },
  'coastal-drive-goa': {
    _id: '2',
    title: 'Chasing Sunsets',
    subtitle: 'The Ultimate Coastal Drive',
    content: '<p class="drop-cap">A 500km journey along the Konkan coast in our premium caravans, exploring hidden beaches and dense mangrove forests. Salt in the air and freedom on the dashboard.</p><div class="cinematic-quote">"The ocean does not apologize for its depth, and we do not apologize for exploring it."</div><h3 id="chapter-1">Chapter 01: The Coastline</h3><p>We tracked the setting sun for 14 straight days.</p>',
    coverImage: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2000&auto=format&fit=crop',
    authorName: 'Sarah Jenkins',
    publishedAt: '2023-09-28T00:00:00.000Z',
    readTime: 5,
    category: 'Travel Notes',
    type: 'vlog',
    tags: ['Coastal', 'Caravan', 'Goa'],
    videoUrl: 'https://www.youtube.com/embed/8efveLZ3E24?rel=0', // Proper iframe embed link
    views: 850,
    director: 'Sarah Jenkins',
    location: 'Konkan Coast, India'
  }
};

const DUMMY_COMMENTS = [
  {
    _id: 'c1',
    content: 'Absolutely breathtaking! I need to book this expedition immediately. How did the vehicles handle the glacial crossings?',
    createdAt: '2023-10-16T10:00:00.000Z',
    guestName: 'Marcus Wright',
    likes: 12,
    replies: [
      {
        _id: 'c1-1',
        content: 'Flawlessly. The air suspension automatically adjusted for the deeper ruts, and the low-range gearing did the heavy lifting. We highly recommend the October batch! Reach out to our concierge.',
        createdAt: '2023-10-16T11:00:00.000Z',
        user: { name: 'Luxor Concierge' }
      }
    ]
  }
];

export default function BlogDetailContent() {
  const { slug } = useParams();

  // Cinematic slow scroll effects
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1500], ['0%', '30%']);
  const yHeroText = useTransform(scrollY, [0, 800], ['0%', '25%']);
  const opacityHeroText = useTransform(scrollY, [0, 500], [1, 0]);

  const post = DUMMY_POSTS[slug] || DUMMY_POSTS['himalayan-ascent'];
  const comments = DUMMY_COMMENTS;
  const isAuth = false;
  const user = null;

  if (!post) {
    return (
      <main className="min-h-screen bg-[#fcfcfc] flex items-center justify-center text-gray-900">
        <p className="font-mono uppercase tracking-widest text-sm text-gray-500">Documentary Not Found.</p>
      </main>
    );
  }

  const cover = post.coverImage;

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-gray-900 selection:bg-[#84cc16] selection:text-white font-sans pb-32">

      {/* ── DOCUMENTARY HERO (Cinematic Letterbox Style) ── */}
      <section className="relative w-full h-screen min-h-[800px] flex flex-col justify-end overflow-hidden bg-black">

        {/* Top Letterbox Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 md:h-24 bg-[#0a0a0a] z-30 flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em]">Recording</span>
          </div>
          <Link href="/blog" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-white transition-colors">
            Exit Viewer
          </Link>
        </div>

        {/* Video / Parallax Cover */}
        <motion.div className="absolute inset-0 z-0" style={{ y: yBg }}>
          {cover ? (
            <img src={cover} alt={post.title} className="w-full h-full object-cover opacity-70 grayscale-[20%]" />
          ) : (
            <div className="w-full h-full bg-gray-900" />
          )}
          {/* Film Grain overlay */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-paper.png")' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </motion.div>

        {/* Hero Title Content */}
        <motion.div style={{ y: yHeroText, opacity: opacityHeroText }} className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-32 max-w-[1600px] mx-auto text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-4xl">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-[#84cc16] mb-6 border border-[#84cc16] px-4 py-2">
                A Luxor Original Documentary
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.9] mb-4 drop-shadow-2xl">
                {post.title}
              </h1>
              {post.subtitle && (
                <h2 className="text-2xl md:text-4xl font-light italic text-gray-300 tracking-tight">
                  {post.subtitle}
                </h2>
              )}
            </div>

            {/* Film Credits Block */}
            <div className="flex flex-col gap-4 text-right hidden lg:flex pb-4">
              <div>
                <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">Director</span>
                <span className="block text-sm font-bold uppercase tracking-widest text-white">{post.director || post.authorName}</span>
              </div>
              <div>
                <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">Location</span>
                <span className="block text-sm font-bold uppercase tracking-widest text-white">{post.location || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">Duration</span>
                <span className="block text-sm font-bold uppercase tracking-widest text-white">{post.readTime} MIN READ</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Letterbox Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-[#0a0a0a] z-30 flex items-center px-6 md:px-12 border-t border-white/5">
          <div className="w-full flex items-center gap-4">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">00:00:00</span>
            <div className="flex-1 h-[2px] bg-white/10 relative">
              <div className="absolute left-0 top-0 h-full w-[2%] bg-[#84cc16]" />
            </div>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">END OF ROLL</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE EDITORIAL BODY ── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-20 relative flex flex-col lg:flex-row gap-16 xl:gap-32 items-start">

        {/* Floating Sidebar (Timeline/Index) */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-32">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-200 pb-4 mb-6">
            Documentary Index
          </h4>
          <ul className="space-y-6 text-xs font-bold uppercase tracking-widest text-gray-900">
            <li className="flex items-center gap-4 group cursor-pointer hover:text-[#84cc16] transition-colors">
              <span className="font-mono text-gray-300 group-hover:text-[#84cc16]">01</span>
              The Departure
            </li>
            <li className="flex items-center gap-4 group cursor-pointer hover:text-[#84cc16] transition-colors">
              <span className="font-mono text-gray-300 group-hover:text-[#84cc16]">02</span>
              Glacial Crossings
            </li>
            <li className="flex items-center gap-4 group cursor-pointer hover:text-[#84cc16] transition-colors">
              <span className="font-mono text-gray-300 group-hover:text-[#84cc16]">03</span>
              The Descent
            </li>
          </ul>

          <div className="mt-16 p-6 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Expedition Log Date</span>
            <span className="block text-sm font-mono text-gray-900">{new Date(post.publishedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Main Reading Flow */}
        <div className="flex-1 w-full max-w-3xl">

          {/* VLOG Video Embed (If applicable) */}
          {post.type === 'vlog' && post.videoUrl && (
            <div className="aspect-video w-full lg:w-[130%] lg:-ml-[15%] xl:w-[150%] xl:-ml-[25%] overflow-hidden bg-black shadow-2xl mb-24 relative mt-10 rounded-xl border border-gray-200">
              {/* Cinematic crop bars */}
              <div className="absolute top-0 left-0 w-full h-8 bg-black/80 z-20 pointer-events-none mix-blend-multiply" />
              <div className="absolute bottom-0 left-0 w-full h-8 bg-black/80 z-20 pointer-events-none mix-blend-multiply" />

              <iframe
                src={post.videoUrl}
                className="w-full h-full relative z-10"
                allowFullScreen
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </div>
          )}

          {/* HTML Documentary Content */}
          {post.content && (
            <article
              className="documentary-prose w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-12 mt-20 border-t border-gray-200">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${t}`}
                  className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-[#84cc16]/10 hover:text-[#84cc16] hover:border-[#84cc16]/30 transition-colors shadow-sm"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          {/* ── COMMENTS SECTION (Audience Reviews) ── */}
          <section className="mt-24 pt-16 border-t-[4px] border-gray-900">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase">
              Audience Reviews
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-12">Total responses: {comments.length}</p>

            {/* Comment Form */}
            <div className="bg-white border-2 border-gray-100 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-16 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#84cc16]" />
              <h3 className="text-[11px] font-black text-gray-900 mb-6 uppercase tracking-[0.2em]">
                Submit Your Review
              </h3>
              <div className="relative z-10">
                <CommentForm blogId={post._id} user={user} isAuth={isAuth} />
              </div>
            </div>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-8">
                {comments.map((c) => (
                  <Comment key={c._id} comment={c} blogId={post._id} user={user} isAuth={isAuth} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ── GLOBAL DOCUMENTARY STYLES ── */}
      <style jsx global>{`
        .documentary-prose {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #111827;
        }

        .documentary-prose p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 2rem;
          color: #374151;
          font-weight: 400;
        }

        .documentary-prose h3 {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
        }

        /* The Drop Cap Effect */
        .documentary-prose p.drop-cap::first-letter {
          font-size: 5rem;
          font-weight: 900;
          float: left;
          line-height: 0.8;
          margin-right: 0.75rem;
          margin-top: 0.2rem;
          color: #84cc16;
        }

        /* Cinematic Pull Quotes */
        .documentary-prose .cinematic-quote {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.02em;
          margin: 4rem -2rem;
          padding: 3rem;
          background-color: #f3f4f6;
          border-left: 8px solid #84cc16;
          color: #111827;
        }

        @media (min-width: 1024px) {
          .documentary-prose .cinematic-quote {
            margin: 5rem -8rem; /* Break out of container */
            font-size: 2.5rem;
            padding: 4rem;
          }
        }

        /* Editorial Images */
        .documentary-prose .editorial-image {
          width: 100%;
          height: auto;
          margin-top: 3rem;
          margin-bottom: 1rem;
        }

        @media (min-width: 1024px) {
          .documentary-prose .editorial-image {
            width: calc(100% + 10rem);
            max-width: none;
            margin-left: -5rem;
          }
        }

        .documentary-prose .image-caption {
          display: block;
          font-size: 0.7rem;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6b7280;
          margin-bottom: 3rem;
          text-align: right;
        }

        /* Telemetry Box */
        .documentary-prose .telemetry-box {
          background-color: #030508;
          color: white;
          padding: 2.5rem;
          margin: 4rem 0;
        }

        .documentary-prose .telemetry-box h4 {
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #84cc16;
          margin-bottom: 1.5rem;
        }

        .documentary-prose .telemetry-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .documentary-prose .telemetry-box li {
          font-family: monospace;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 0.5rem;
        }

        .documentary-prose .telemetry-box li strong {
          display: block;
          color: #9ca3af;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 0.25rem;
        }

        @media (max-width: 640px) {
          .documentary-prose .telemetry-box ul {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
