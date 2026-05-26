import Image from 'next/image';
import { UsersIcon, ClockIcon } from '@/assets/icons';

function isExternal(url) {
  return url?.startsWith('http://') || url?.startsWith('https://');
}

export default function RoomCard({ room, isSelected, onSelect, hasBlocks = false }) {
  const imgSrc = room.images?.[0]?.url || '/Images/camp.jpg';

  return (
    <div 
      className={`group relative h-[380px] w-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isSelected 
          ? 'ring-4 ring-[#84cc16] ring-offset-2 ring-offset-gray-50 shadow-[0_20px_40px_-10px_rgba(132,204,22,0.3)] scale-[1.02]' 
          : 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1'
      }`}
      onClick={onSelect}
    >
      {/* Background Cinematic Image */}
      <div className="absolute inset-0 bg-gray-900">
        <Image
          src={imgSrc}
          alt={room.category || ''}
          fill
          className={`object-cover opacity-90 transition-transform duration-1000 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
          unoptimized={isExternal(imgSrc)}
        />
      </div>
      
      {/* Heavy Editorial Gradients for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/90 pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        {hasBlocks ? (
          <span className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-rose-400/30">
            Limited
          </span>
        ) : (
          <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            Available
          </span>
        )}
        
        {isSelected && (
          <div className="w-8 h-8 rounded-full bg-[#84cc16] text-gray-900 flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.6)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Editorial Content */}
      <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end z-10">
        
        {/* Title and Capacity */}
        <div className="mb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#84cc16] drop-shadow-md mb-1">STAY OPTION</p>
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-xl font-black text-white leading-tight drop-shadow-lg truncate">
              {room.category || room.roomNumber}
            </h3>
            {(room.maxCapacity || room.capacity) && (
              <div className="flex items-center gap-1.5 shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-2 py-1">
                <UsersIcon className="w-3.5 h-3.5 text-white/80" />
                <span className="text-[10px] font-bold text-white">x {room.maxCapacity || room.capacity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timings */}
        {(room.checkInTime || room.checkOutTime) && (
          <div className="flex items-center gap-3 text-[10px] font-semibold text-white/60 mb-3 border-l-2 border-[#84cc16] pl-2">
            {room.checkInTime && <span>IN: {room.checkInTime}</span>}
            {room.checkInTime && room.checkOutTime && <span className="w-1 h-1 rounded-full bg-white/30" />}
            {room.checkOutTime && <span>OUT: {room.checkOutTime}</span>}
          </div>
        )}

        {/* Facilities Preview */}
        {room.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {room.facilities.slice(0, 3).map((f) => (
              <span key={f} className="text-[9px] font-bold uppercase tracking-wide text-white bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                {f}
              </span>
            ))}
            {room.facilities.length > 3 && (
              <span className="text-[9px] font-bold text-white/50 px-1 py-1">
                +{room.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Bottom Row: Price + Button */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          {room.price != null && (
            <div>
              <span className="block text-white text-xl md:text-2xl font-black tracking-tight drop-shadow-lg leading-none">
                ₹{Number(room.price).toLocaleString('en-IN')}
              </span>
              <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest ml-0.5">/ night</span>
            </div>
          )}
          
          <button
            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-xl ${
              isSelected
                ? 'bg-[#84cc16] text-gray-900 border-none pointer-events-none'
                : 'bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-gray-900'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
