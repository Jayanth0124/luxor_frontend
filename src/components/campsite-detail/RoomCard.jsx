import Image from 'next/image';
import { UsersIcon, ClockIcon } from '@/assets/icons';

function isExternal(url) {
  return url?.startsWith('http://') || url?.startsWith('https://');
}

export default function RoomCard({ room, isSelected, onSelect, hasBlocks = false }) {
  const imgSrc = room.images?.[0]?.url || '/Images/camp.jpg';

  return (
    <div className={`group border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer ${isSelected ? 'border-[#84cc16]/40 ring-2 ring-[#84cc16]/40' : 'border-gray-100 hover:border-[#84cc16]/40'}`}>
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={room.category || ''}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={isExternal(imgSrc)}
        />
        {room.price != null && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-[#84cc16] text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full">
              ₹{Number(room.price).toLocaleString('en-IN')}/night
            </span>
          </div>
        )}
        {hasBlocks && (
          <div className="absolute top-3 left-3">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              Partially blocked
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">{room.category || room.roomNumber}</h3>
          {(room.maxCapacity || room.capacity) && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <UsersIcon className="w-3.5 h-3.5 text-gray-300" />
              <span>Up to {room.maxCapacity || room.capacity}</span>
            </div>
          )}
        </div>
        {(room.checkInTime || room.checkOutTime) && (
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            {room.checkInTime && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Check-in {room.checkInTime}
              </span>
            )}
            {room.checkInTime && room.checkOutTime && <span className="text-gray-200">·</span>}
            {room.checkOutTime && <span>Check-out {room.checkOutTime}</span>}
          </div>
        )}
        {room.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.facilities.map((f) => (
              <span key={f} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-lg font-medium">
                {f}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={onSelect}
          className={`w-full cursor-pointer border font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 ${
            isSelected
              ? 'bg-[#84cc16] border-[#84cc16] text-gray-900'
              : 'border-[#84cc16] text-[#84cc16] hover:bg-[#84cc16] hover:text-gray-900'
          }`}
        >
          {isSelected ? 'Selected ✓' : 'Select & Book'}
        </button>
      </div>
    </div>
  );
}
