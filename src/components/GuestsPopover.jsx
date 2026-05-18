import { motion } from 'framer-motion';

export default function GuestsPopover({ isOpen, guests, onChange }) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className="absolute top-full right-0 mt-4 bg-white/90 backdrop-blur-2xl border border-gray-100 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] w-[280px] z-50 origin-top"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">Guests</p>
          <p className="text-xs text-gray-400">Ages 2 or above</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors">−</button>
          <span className="w-4 text-center font-semibold">{guests}</span>
          <button onClick={() => onChange(guests + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors">+</button>
        </div>
      </div>
    </motion.div>
  );
}
