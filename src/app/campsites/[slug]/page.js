'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon } from '@/assets/icons';
import ImageGallery from '@/components/vehicle-detail/ImageGallery';
import CampsiteFacilities from '@/components/campsite-detail/CampsiteFacilities';
import CampsiteRules from '@/components/campsite-detail/CampsiteRules';
import CampsiteBookingCard from '@/components/campsite-detail/CampsiteBookingCard';
import RoomCard from '@/components/campsite-detail/RoomCard';
import ReviewsSection from '@/components/ReviewsSection';
import CancellationPolicySection from '@/components/CancellationPolicySection';
import YouTubeVideos from '@/components/YouTubeVideos';
import { getCampsiteBySlug, getCampsiteBlockedPeriods } from '@/services/campsites.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8081';

function resolveImg(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

function StarRow({ rating, numReviews, onReviewClick }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className="w-4 h-4" fill={n <= Math.round(rating) ? '#84cc16' : 'none'}
          viewBox="0 0 24 24" stroke="#84cc16" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
      <span className="text-white font-bold text-sm ml-1">{rating}</span>
      {numReviews > 0 && (
        <button onClick={onReviewClick} className="text-white/60 text-xs hover:text-white transition-colors ml-0.5">
          ({numReviews} review{numReviews !== 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}

const DUMMY_CAMPSITES = [
  {
    _id: '1',
    name: 'Starfall Meadow Camp',
    slug: 'starfall-meadow-camp',
    stayType: 'Glamping',
    city: 'Manali',
    state: 'HP',
    address: 'Starfall Meadow, Solang Valley',
    guests: 4,
    price: 4500,
    averageRating: 4.9,
    totalReviews: 128,
    images: [
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop' },
      { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Starfall Meadow Camp offers a high-end luxury glamping experience nestled in the beautiful Solang Valley of Manali. Enjoy spectacular starry nights, gourmet local cuisine, and comfortable heated tents with ensuite facilities.',
    facilities: ['Ensuite Bathroom', 'Room Heating', 'Campfire & BBQ', 'Wi-Fi', 'Guided Trekking', 'Hot Shower'],
    rooms: [
      {
        _id: 'room-1a',
        name: 'Luxury Dome Tent',
        price: 4500,
        capacity: 2,
        facilities: ['King Bed', 'Attached Bath', 'Private Deck', 'Heater']
      },
      {
        _id: 'room-1b',
        name: 'Family Safari Suite',
        price: 7500,
        capacity: 4,
        facilities: ['Two Queen Beds', 'Attached Bath', 'Heater', 'Mini Fridge']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-1',
      name: 'Himalayan Escapes Inc.'
    }
  },
  {
    _id: '2',
    name: 'Spiti Wilderness Retreat',
    slug: 'spiti-wilderness-retreat',
    stayType: 'Camping',
    city: 'Kaza',
    state: 'HP',
    address: 'Rangrik Plain, near Kaza',
    guests: 6,
    price: 3200,
    averageRating: 4.8,
    totalReviews: 94,
    images: [
      { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Immerse yourself in the raw and rugged landscapes of Spiti Valley. This rustic yet comfortable retreat is perfect for stargazing and peaceful contemplation far away from the grid.',
    facilities: ['Common Kitchen', 'Campfire Area', 'Shared Bathrooms', 'Stargazing Equipment', 'Motorcycle Parking'],
    rooms: [
      {
        _id: 'room-2a',
        name: 'Alpine Ridge Tent',
        price: 3200,
        capacity: 2,
        facilities: ['Twin Beds', 'Sleeping Bags', 'Solar Charger']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-2',
      name: 'Spiti Overland'
    }
  },
  {
    _id: '3',
    name: 'Riverside Forest Lodge',
    slug: 'riverside-forest-lodge',
    stayType: 'Eco Stay',
    city: 'Rishikesh',
    state: 'UK',
    address: 'Neer Garh Forest, Rishikesh',
    guests: 8,
    price: 5800,
    averageRating: 4.7,
    totalReviews: 212,
    images: [
      { url: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Set on the banks of a sparkling jungle stream near Rishikesh, this eco-lodge blends modern rustic comfort with pure natural beauty. Sleep to the sound of flowing water and wake up to forest bird calls.',
    facilities: ['Jungle Access', 'Organic Café', 'Yoga Shala', 'Wi-Fi', 'Power Backup', 'Geyser Shower'],
    rooms: [
      {
        _id: 'room-3a',
        name: 'Riverside Cottage',
        price: 5800,
        capacity: 3,
        facilities: ['King Bed', 'Jungle View', 'Balcony', 'Ensuite Bath']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-3',
      name: 'Ganga Wilderness Group'
    }
  },
  {
    _id: '4',
    name: 'Coorg Canopy Nest',
    slug: 'coorg-canopy-nest',
    stayType: 'Treehouse',
    city: 'Coorg',
    state: 'KA',
    address: 'Madikeri Hills Estate',
    guests: 2,
    price: 7200,
    averageRating: 5.0,
    totalReviews: 61,
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Perched high in the canopy of a beautiful coffee estate in Coorg, this private wood treehouse is a cozy sanctuary for couples looking for seclusion and pure pristine wilderness views.',
    facilities: ['Private Treehouse', 'Ensuite Bath', 'Estate Tours', 'Breakfast Included', 'Balcony overlooking forest'],
    rooms: [
      {
        _id: 'room-4a',
        name: 'Woodland Treehouse',
        price: 7200,
        capacity: 2,
        facilities: ['Queen Bed', 'Creek View', 'Attached Bath']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-4',
      name: 'Coorg Estate Stays'
    }
  },
  {
    _id: '5',
    name: 'Valley of Flowers Basecamp',
    slug: 'valley-of-flowers-basecamp',
    stayType: 'Camping',
    city: 'Chamoli',
    state: 'UK',
    address: 'Govindghat Track, Chamoli',
    guests: 10,
    price: 2800,
    averageRating: 4.6,
    totalReviews: 77,
    images: [
      { url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'The absolute best basecamp for trekkers ascending to the majestic Valley of Flowers and Hemkund Sahib. Practical, clean, warm, and staffed by friendly local guides.',
    facilities: ['Warm Blankets', 'Hot Meals', 'First Aid', 'Luggage Storage', 'Local Guides'],
    rooms: [
      {
        _id: 'room-5a',
        name: 'Standard Trekker Tent',
        price: 2800,
        capacity: 3,
        facilities: ['Sleeping Mats', 'Sleeping Bags', 'Common Bath']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-5',
      name: 'Garhwal Treks'
    }
  },
  {
    _id: '6',
    name: 'Chopta Alpine Pods',
    slug: 'chopta-alpine-pods',
    stayType: 'Glamping',
    city: 'Chopta',
    state: 'UK',
    address: 'Meadows of Chopta, Chamoli',
    guests: 3,
    price: 6100,
    averageRating: 4.8,
    totalReviews: 43,
    images: [
      { url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Sleep in luxurious insulated glass-fronted pods looking directly out at the majestic snowy peaks of Nanda Devi. Experience Chopta—the Switzerland of India—in ultimate comfort.',
    facilities: ['Glass Front Pods', 'Room Heater', 'Gourmet Dining', 'Outdoor Deck', 'Snow Trekking'],
    rooms: [
      {
        _id: 'room-6a',
        name: 'Alpine Panoramic Pod',
        price: 6100,
        capacity: 2,
        facilities: ['King Bed', 'Glass Wall', 'Luxury Bath', 'Heater']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-6',
      name: 'Alpine Pods Chopta'
    }
  },
  {
    _id: '7',
    name: 'Kasol Creekside Camp',
    slug: 'kasol-creekside-camp',
    stayType: 'Camping',
    city: 'Kasol',
    state: 'HP',
    address: 'Creekside Parvati Valley, Kasol',
    guests: 6,
    price: 2200,
    averageRating: 4.5,
    totalReviews: 189,
    images: [
      { url: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'Pitch your tent directly next to the rushing glacial streams of the Parvati River in Kasol. Known for its laidback atmosphere and beautiful pine forests.',
    facilities: ['Parvati River View', 'Café Access', 'Common Bonfire', 'Wi-Fi Zone', 'Trekking Gear Rental'],
    rooms: [
      {
        _id: 'room-7a',
        name: 'Standard Riverside Dome',
        price: 2200,
        capacity: 2,
        facilities: ['Double Mattresses', 'Sleeping Bags', 'Common Bath']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-7',
      name: 'Parvati Adventures'
    }
  },
  {
    _id: '8',
    name: 'Bir Billing Sky Lodge',
    slug: 'bir-billing-sky-lodge',
    stayType: 'Eco Stay',
    city: 'Bir',
    state: 'HP',
    address: 'Billing Landing Site Road, Bir',
    guests: 4,
    price: 5400,
    averageRating: 4.9,
    totalReviews: 57,
    images: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop' }
    ],
    description: 'An elegant stone-built eco-retreat overlooking the landing site of Bir paragliders. Perfect mountain sunset views and quick access to paragliding spots.',
    facilities: ['Paragliding Assist', 'Solar Powered', 'Local Organic Food', 'Private Balcony', 'Outdoor Seating'],
    rooms: [
      {
        _id: 'room-8a',
        name: 'Sunset Balcony Suite',
        price: 5400,
        capacity: 2,
        facilities: ['King Bed', 'Attached Bath', 'Balcony', 'Room Heater']
      }
    ],
    youtubeVideos: [],
    partner: {
      _id: 'partner-8',
      name: 'Bir Paragliding Stays'
    }
  }
];

export default function CampsiteDetailPage() {
  const { slug } = useParams();
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const { data: campsite, isLoading, isError } = useQuery({
    queryKey: ['public-campsite', slug],
    queryFn: () => getCampsiteBySlug(slug),
    enabled: !!slug,
  });

  const { data: allBlocks = [] } = useQuery({
    queryKey: ['campsite-blocked-periods', campsite?._id],
    queryFn: () => getCampsiteBlockedPeriods(campsite._id),
    enabled: !!campsite?._id,
  });

  const hasCampsiteWideBlock = allBlocks.some((b) => !b.roomId);
  const roomHasBlocks = (roomId) =>
    hasCampsiteWideBlock ||
    allBlocks.some((b) => b.roomId && (b.roomId === roomId || b.roomId?.toString() === roomId?.toString()));

  useEffect(() => {
    if (campsite?.rooms?.[0]?._id && !selectedRoomId) {
      setSelectedRoomId(campsite.rooms[0]._id);
    }
  }, [campsite]);

  if (isLoading) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isError || !campsite) return (
    <div className="bg-[#f8fafc] min-h-screen pt-16 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Campsite not found.</p>
    </div>
  );

  const c = campsite;
  const facilities = c.facilities?.map((f) => f.name ?? f) ?? [];
  const rating = c.averageRating;
  const numReviews = c.totalReviews ?? 0;
  const heroImg = resolveImg(c.images?.[0]?.url, '/Images/camp.jpg');
  const minPrice = c.rooms?.reduce((min, r) => (r.price != null && r.price < min ? r.price : min), Infinity);
  const displayPrice = isFinite(minPrice) ? minPrice : null;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24 pt-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── BREADCRUMBS ── */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
          <span>/</span>
          <a href="/campsites" className="hover:text-gray-900 transition-colors">Campsites</a>
          <span>/</span>
          <span className="text-gray-900">{c.name}</span>
        </nav>

        {/* ── NATURE RETREAT HEADER CARD ── */}
        <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
          <div>
            {(c.stayType?.name ?? c.stayType) && (
              <span className="inline-block bg-lime-50 text-[#65a30d] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-4 border border-lime-100">
                {c.stayType?.name ?? c.stayType}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
              {c.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-600">
              <div className="flex items-center gap-1.5 bg-[#84cc16]/10 text-[#65a30d] px-2.5 py-1 rounded-md">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                <span>{rating} <span className="text-gray-500 font-medium">({numReviews} Reviews)</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-4.5 h-4.5 text-gray-400" />
                <span>{[c.address, c.city, c.state].filter(Boolean).join(', ')}</span>
              </div>
              {(c.partner?.name || c.partner?.businessName) && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span>Hosted by <span className="text-gray-900">{c.partner?.name || c.partner?.businessName}</span></span>
                </div>
              )}
            </div>
          </div>
          
          {displayPrice != null && (
            <div className="shrink-0 text-right bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Starting From</p>
              <div className="text-3xl font-black text-gray-900">
                ₹{Number(displayPrice).toLocaleString('en-IN')}
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-1">per night</p>
            </div>
          )}
        </div>

        {/* ── TWO-COLUMN CONTENT ARCHITECTURE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">

          {/* Left Column: Media & Details */}
          <div className="flex flex-col gap-10">
            
            {/* Gallery integrated into left column flow (Differs from Vehicles) */}
            <div className="rounded-3xl overflow-hidden shadow-sm">
              <ImageGallery images={c.images ?? []} fallback="/Images/camp.jpg" name={c.name} />
            </div>

            {/* About text */}
            {c.description && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">About this Retreat</h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{c.description}</p>
              </div>
            )}

            <CampsiteFacilities facilities={facilities} />

            {/* Available Stays */}
            {c.rooms?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84cc16] mb-1">ACCOMMODATIONS</p>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Available Stays</h2>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{c.rooms.length} Option{c.rooms.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {c.rooms.map((room, i) => (
                    <RoomCard
                      key={room._id || i}
                      room={{
                        ...room,
                        category: room.category?.name ?? room.category,
                        facilities: room.facilities?.map((f) => f.name ?? f) ?? [],
                      }}
                      isSelected={selectedRoomId === (room._id || i)}
                      onSelect={() => setSelectedRoomId(room._id)}
                      hasBlocks={roomHasBlocks(room._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <CampsiteRules campsite={c} />

            {c.partner?._id && (
              <CancellationPolicySection partnerId={c.partner._id} />
            )}

            <ReviewsSection
              refType="Campsite"
              entityId={c._id}
              averageRating={c.averageRating}
              totalReviews={c.totalReviews}
            />
          </div>

          {/* Right Column: Sticky Booking Engine */}
          <div className="w-full">
            <div className="sticky top-24">
              <CampsiteBookingCard campsite={c} selectedRoomId={selectedRoomId} onRoomSelect={setSelectedRoomId} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
