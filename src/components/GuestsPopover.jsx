import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GuestsPopover({ isOpen, guests, onChange }) {
  const [placement, setPlacement] = useState('up');
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePositioning = () => {
      if (isOpen && containerRef.current) {
        const parent = containerRef.current.parentNode;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelowViewport = viewportHeight - parentRect.bottom;
          const spaceAboveViewport = parentRect.top;
          
          const docScrollY = window.scrollY || document.documentElement.scrollTop;
          const totalDocHeight = document.documentElement.scrollHeight;
          const spaceBelowDocument = totalDocHeight - (docScrollY + parentRect.bottom);
          
          const requiredSpace = 160;
          
          if (docScrollY < 120 && spaceBelowDocument >= requiredSpace) {
            setPlacement('down');
          } else if (spaceBelowViewport >= requiredSpace) {
            setPlacement('down');
          } else if (spaceAboveViewport >= requiredSpace) {
            setPlacement('up');
          } else {
            if (spaceBelowViewport + spaceBelowDocument > spaceAboveViewport) {
              setPlacement('down');
            } else {
              setPlacement('up');
            }
          }
        }
      }
    };

    handlePositioning();
    window.addEventListener('resize', handlePositioning);
    window.addEventListener('scroll', handlePositioning, { passive: true });

    return () => {
      window.removeEventListener('resize', handlePositioning);
      window.removeEventListener('scroll', handlePositioning);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: placement === 'up' ? 15 : -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: placement === 'up' ? 15 : -15, scale: 0.95 }}
      className={`absolute right-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-[280px] z-50 overflow-hidden flex flex-col font-sans ${
        placement === 'up'
          ? 'bottom-full mb-4 origin-bottom shadow-[0_-20px_60px_rgba(0,0,0,0.1)]'
          : 'top-full mt-4 origin-top shadow-[0_20px_60px_rgba(0,0,0,0.1)]'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">Guests</p>
          <p className="text-xs text-gray-400">Ages 2 or above</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(Math.max(1, guests - 1)); }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors"
          >
            −
          </button>
          <span className="w-4 text-center font-semibold">{guests}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(guests + 1); }}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}
