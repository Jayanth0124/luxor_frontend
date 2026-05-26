'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import VehicleCard from './VehicleCard';
import { getVehicles } from '@/services/vehicles.service';

const DUMMY_VEHICLES = [
  {
    _id: '1',
    name: 'Luxor Expedition Defender',
    category: 'Expedition SUV',
    seatingCapacity: 5,
    city: 'Manali',
    state: 'HP',
    price: 8500,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '2',
    name: 'Overland Camper Cruiser',
    category: 'Campervan',
    seatingCapacity: 4,
    city: 'Leh',
    state: 'JK',
    price: 12000,
    rating: 4.8,
    reviews: 29,
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '3',
    name: 'Desert Storm Safari 4x4',
    category: 'Expedition SUV',
    seatingCapacity: 7,
    city: 'Jaisalmer',
    state: 'RJ',
    price: 9500,
    rating: 4.7,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '4',
    name: 'Luxor Luxury Glamping Caravan',
    category: 'Luxury Caravan',
    seatingCapacity: 4,
    city: 'Bengaluru',
    state: 'KA',
    price: 15000,
    rating: 5.0,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '5',
    name: 'Western Ghats Trailblazer',
    category: 'Camping Caravan',
    seatingCapacity: 5,
    city: 'Coorg',
    state: 'KA',
    price: 11000,
    rating: 4.8,
    reviews: 31,
    image: 'https://images.unsplash.com/photo-1513313778780-9ae4807465f2?q=80&w=1000&auto=format&fit=crop',
  },
  {
    _id: '6',
    name: 'Conqueror Overland Truck',
    category: 'Heavy Duty Camper',
    seatingCapacity: 3,
    city: 'Shimla',
    state: 'HP',
    price: 18000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop',
  }
];

export default function VehicleListings() {
  const vehicles = DUMMY_VEHICLES;
  const isLoading = false;

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 md:px-10 xl:px-16 bg-white">
      <div className="max-w-screen-xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[#84cc16] text-xs font-black uppercase tracking-[0.22em] mb-2">Premium Fleet</p>
            <h2 className="text-gray-900 font-black leading-none" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}>
              Featured Vehicles
            </h2>
            <p className="text-gray-400 text-sm mt-2">Handpicked luxury vehicles across India's top cities</p>
          </div>
          <Link href="/vehicles" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#84cc16] text-sm font-semibold transition-colors shrink-0">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">No vehicles listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        )}

        {!isLoading && vehicles.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/vehicles" className="inline-flex items-center gap-2 text-gray-900 font-black text-sm px-8 py-3.5 rounded-xl bg-[#84cc16] hover:brightness-110 transition-all">
              Browse All Vehicles
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
