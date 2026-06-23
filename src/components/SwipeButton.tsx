import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SwipeButtonProps {
  onSuccess: () => void;
  text?: string;
  successText?: string;
  className?: string;
  colorClass?: string;
  bgClass?: string;
}

export function SwipeButton({ 
  onSuccess, 
  text = 'SWIPE TO PAY', 
  successText = 'PROCESSING...', 
  className = '',
  colorClass = 'bg-kite-blue',
  bgClass = 'bg-kite-bg'
}: SwipeButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const buttonWidth = 56; // h-14 w-14 -> 56px

  const x = useMotionValue(0);
  const controls = useAnimation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      isMounted.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDragEnd = async (event: any, info: any) => {
    if (isSuccess) return;
    
    // If dragged past 80%
    const threshold = containerWidth - buttonWidth - 10;
    if (info.offset.x >= threshold * 0.75) {
      setIsSuccess(true);
      await controls.start({ x: containerWidth - buttonWidth });
      setTimeout(() => {
        onSuccess();
        setTimeout(() => {
          if (isMounted.current) {
            setIsSuccess(false);
            controls.set({ x: 0 });
          }
        }, 1000);
      }, 300);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const bgOpacity = useTransform(x, [0, containerWidth - buttonWidth], [0, 0.4]);

  return (
    <>
      {/* Mobile Swipe Button */}
      <div 
        ref={containerRef} 
        className={`md:hidden relative w-full h-14 rounded-full flex items-center justify-center overflow-hidden border border-kite-border select-none ${bgClass} ${className}`}
      >
        {/* Background fill that follows the button */}
        <motion.div 
          className={`absolute left-0 top-0 bottom-0 ${colorClass}`}
          style={{ width: x, opacity: bgOpacity }}
        />
        
        {/* Text inside the button */}
        <div className={`absolute pointer-events-none z-10 font-medium uppercase tracking-widest text-sm transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'} ${bgClass === 'bg-kite-bg' ? 'text-kite-text-light' : 'text-white'}`}>
          {text}
        </div>

        {isSuccess && (
          <div className={`absolute pointer-events-none z-10 font-medium uppercase tracking-widest text-sm text-kite-text`}>
            {successText}
          </div>
        )}

        {/* Draggable knob */}
        <motion.div
          drag={isSuccess ? false : "x"}
          dragConstraints={{ left: 0, right: containerWidth - buttonWidth }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className={`absolute left-0 top-0 bottom-0 w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 ${colorClass} text-white`}
        >
          <ChevronRight size={24} className={isSuccess ? 'opacity-0' : 'opacity-100'} />
          {isSuccess && (
             <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="absolute w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
             />
          )}
        </motion.div>
      </div>

      {/* Desktop Button */}
      <button 
        onClick={() => {
            if (isSuccess) return;
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
                setTimeout(() => {
                  if (isMounted.current) setIsSuccess(false);
                }, 1000);
            }, 300);
        }}
        className={`hidden md:flex w-full h-12 rounded-sm items-center justify-center transition-opacity hover:opacity-90 ${colorClass} text-white font-medium uppercase tracking-widest text-sm ${className}`}
      >
        {isSuccess ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
            text.replace('SWIPE TO ', '')
        )}
      </button>
    </>
  );
}
