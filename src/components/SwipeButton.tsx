import React, { useState, useRef, useEffect } from"react";
import { motion, useAnimation, useMotionValue } from"framer-motion";
import { ChevronRight, Loader2 } from"lucide-react";
interface SwipeButtonProps {
  onSuccess: () => void;
  text: string;
  successText?: string;
  actionType?:"BUY" |"SELL";
  className?: string;
  colorClass?: string;
  bgClass?: string;
  textClass?: string;
  knobClass?: string;
  mobileContainerClass?: string;
  mobileThumbClass?: string;
  mobileThumbSize?: number;
  mobileHeight?: number;
}
export function SwipeButton({
  onSuccess,
  text,
  successText ="PROCESSING...",
  actionType,
  className ="",
  colorClass ="bg-kite-blue",
  bgClass ="bg-kite-blue",
  textClass,
  knobClass,
  mobileContainerClass ="w-full h-11 rounded-full",
  mobileThumbClass ="w-10 h-10 rounded-full",
  mobileThumbSize = 40,
  mobileHeight = 44,
}: SwipeButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const isMounted = useRef(true);
  // Use refined specs ONLY if actionType is provided (Investments page)
  const isRefined = actionType ==="BUY" || actionType ==="SELL";

  // Constants
  const BUTTON_HEIGHT = isRefined ? 56 : mobileHeight;
  const THUMB_SIZE = isRefined ? 52 : mobileThumbSize;
  const BORDER_RADIUS = isRefined ? 28 : mobileHeight / 2;
  const PADDING = isRefined ? 2 : (mobileHeight - mobileThumbSize) / 2;
  const BUTTON_WIDTH = isRefined ?"65%" :"100%";

  // Background colors
  let bgColor = bgClass;
  if (isRefined) {
    bgColor = actionType ==="BUY" ?"#4A8DF7" :"#E14C4C";
  }

  useEffect(() => {
    isMounted.current = true;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      isMounted.current = false;
      window.removeEventListener("resize", updateWidth);
    };
  }, [isRefined]);

  // re-run if it changes
  const handleDragEnd = async (event: any, info: any) => {
    if (isSuccess) return;
    const maxDrag = containerWidth - THUMB_SIZE - PADDING * 2;
    const threshold = maxDrag * 0.75;
    if (info.offset.x >= threshold) {
      setIsSuccess(true);
      // Snap to end
      await controls.start({
        x: maxDrag,
        transition: { type:"tween", ease:"easeOut", duration: 0.2 },
      });

      // Fire success
      setTimeout(() => {
        if (isMounted.current) onSuccess();

        // Reset smoothly
        setTimeout(() => {
          if (isMounted.current) {
            setIsSuccess(false);
            controls.start({
              x: 0,
              transition: { type:"tween", ease:"easeOut", duration: 0.4 },
            });
          }
        }, 1000);
      }, 300);
    } else {
      // Snap back
      controls.start({
        x: 0,
        transition: { type:"tween", ease:"easeOut", duration: 0.3 },
      });
    }
  };
  return (
    <div
      className={`flex flex-col items-center justify-center w-full ${className}`}
    >
      <div
        ref={containerRef}
        className={
          isRefined
            ?"md:hidden"
            :"md:hidden relative flex items-center justify-center overflow-hidden border-0 select-none"
        }
        style={
          isRefined
            ? {
                width: BUTTON_WIDTH,
                height: `${BUTTON_HEIGHT}px`,
                backgroundColor: bgColor,
                borderRadius: `${BORDER_RADIUS}px`,
                position:"relative",
                display:"flex",
                alignItems:"center",
                overflow:"hidden",
                userSelect:"none",
                WebkitUserSelect:"none",
                margin:"0 auto", // Force hardware acceleration for smooth 60fps
                transform:"translateZ(0)",
                willChange:"transform",
              }
            : {
                width:"100%",
                height: `${mobileHeight}px`,
                backgroundColor: bgColor?.includes("#") ? bgColor : undefined,
                borderRadius: `${mobileHeight / 2}px`,
              }
        }
      >
        {""}
        {isRefined ? (
          <>
            {""}
            {/* Animated text container that moves with the thumb */}{""}
            <motion.div
              style={{
                position:"absolute",
                width:"100%",
                boxSizing:"border-box", // Center text in the space to the right of the thumb
                paddingLeft: `${THUMB_SIZE + PADDING * 2}px`,
                textAlign:"center",
                fontSize:"14px",
                fontWeight: 500,
                color:"#FFFFFF",
                letterSpacing:"1px",
                pointerEvents:"none",
                opacity: isSuccess ? 0 : 1,
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                height:"100%",
                x, // Move text perfectly in sync with thumb
                // Hardware acceleration
                translateZ: 0,
                willChange:"transform, opacity",
              }}
            >
              <span className="whitespace-nowrap">{text}</span>
            </motion.div>{""}
            {/* Success text */}{""}
            <motion.div
              style={{
                position:"absolute",
                width:"100%",
                textAlign:"center",
                fontSize:"14px",
                fontWeight: 500,
                color:"#FFFFFF",
                letterSpacing:"1px",
                pointerEvents:"none",
                opacity: isSuccess ? 1 : 0,
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                height:"100%",
                translateZ: 0,
              }}
              animate={{ opacity: isSuccess ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {""}
              {successText}{""}
            </motion.div>{""}
            {/* Draggable Thumb */}{""}
            <motion.div
              drag={isSuccess ? false :"x"}
              dragConstraints={{
                left: 0,
                right:
                  containerWidth > 0
                    ? containerWidth - THUMB_SIZE - PADDING * 2
                    : 0,
              }}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{
                x,
                width: `${THUMB_SIZE}px`,
                height: `${THUMB_SIZE}px`,
                borderRadius: `${BORDER_RADIUS}px`,
                backgroundColor:"#FFFFFF",
                border: `2px solid #FFFFFF`,
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                cursor: isSuccess ?"default" :"grab",
                position:"absolute",
                left: `${PADDING}px`,
                zIndex: 10,
                boxShadow:"0px 2px 6px rgba(0,0,0,0.15)", // Hardware acceleration
                translateZ: 0,
                willChange:"transform",
              }}
              whileTap={isSuccess ? {} : { cursor:"grabbing" }}
            >
              <div
                style={{
                  color: bgColor,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                }}
              >
                {""}
                {isSuccess ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <ChevronRight size={24} />
                )}{""}
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {""}
            {/* Legacy implementation for Investors.tsx */}{""}
            <motion.div
              style={{ x, width:"100%", left: 0 }}
              className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300 ${isSuccess ?"opacity-0" :"opacity-100"} ${textClass ? textClass : bgClass ==="bg-kite-bg" ?"text-kite-text-light" :"text-white"}`}
            >
              {""}
              {text}{""}
            </motion.div>{""}
            {isSuccess && (
              <div
                style={{ width:"100%", left: 0 }}
                className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 ${textClass ? textClass : bgClass ==="bg-kite-bg" ?"text-kite-text-light" :"text-white"}`}
              >
                {""}
                {successText}{""}
              </div>
            )}{""}
            <motion.div
              drag={isSuccess ? false :"x"}
              dragConstraints={{
                left: 0,
                right:
                  containerWidth > 0
                    ? containerWidth - THUMB_SIZE - PADDING * 2
                    : 0,
              }}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              animate={controls}
              transition={{ type:"tween", ease:"easeOut", duration: 0.3 }}
              style={{ x }}
              className={`absolute left-[2px] top-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 ${mobileThumbClass} ${knobClass ? knobClass : `${colorClass} text-white`}`}
            >
              <ChevronRight
                size={24}
                className={isSuccess ?"opacity-0" :"opacity-100"}
              />{""}
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
              )}{""}
            </motion.div>
          </>
        )}{""}
      </div>{""}
      {/* Desktop Button (unchanged) */}{""}
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
        className={`hidden md:flex w-full h-11 rounded-sm items-center justify-center transition-opacity hover:opacity-90 ${colorClass} text-white font-medium uppercase tracking-[0.5px] text-[13px] md:text-[14px] ${className}`}
      >
        {""}
        {isSuccess ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          text.replace("SWIPE TO","")
        )}{""}
      </button>
    </div>
  );
}
