import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

interface SwipeButtonProps {
  onSuccess: () => void;
  text: string;
  successText?: string;
  actionType?: "BUY" | "SELL";
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
  successText = "PROCESSING...",
  actionType,
  className = "",
  colorClass = "bg-kite-blue",
}: SwipeButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const isMounted = useRef(true);

  // Exact Mobile Dimensions as requested
  const HEIGHT = 56;
  const THUMB_DIAMETER = 48;
  const BORDER_RADIUS = 28;
  const PADDING = (HEIGHT - THUMB_DIAMETER) / 2;

  let bgStyle = actionType === "SELL" 
    ? "#DF514C" 
    : "#4184F3";
  

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
  }, []);

  const handleDragEnd = async (event: any, info: any) => {
    if (isSuccess) return;
    const maxDrag = containerWidth - THUMB_DIAMETER - PADDING * 2;
    const threshold = maxDrag * 0.75;
    if (info.offset.x >= threshold) {
      setIsSuccess(true);
      await controls.start({
        x: maxDrag,
        transition: { type: "spring", bounce: 0.2, duration: 0.4 },
      });
      setTimeout(() => {
        if (isMounted.current) onSuccess();
        setTimeout(() => {
          if (isMounted.current) {
            setIsSuccess(false);
            controls.start({ x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } });
          }
        }, 500);
      }, 1000);
    } else {
      controls.start({ x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.3 } });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Swipe Button */}
      <div
        ref={containerRef}
        className="md:hidden"
        style={{
          width: "100%",
          maxWidth: "240px",
          margin: "0 auto",
          height: `${HEIGHT}px`,
          backgroundColor: bgStyle,
          borderRadius: `${BORDER_RADIUS}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
          transform: "translateZ(0)",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            boxSizing: "border-box",
            paddingLeft: `${THUMB_DIAMETER + PADDING * 2}px`,
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "0.5px",
            pointerEvents: "none",
            opacity: isSuccess ? 0 : 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            x,
          }}
        >
          {text}
        </motion.div>
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "0.5px",
            pointerEvents: "none",
            opacity: isSuccess ? 1 : 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
          animate={{ opacity: isSuccess ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* success text removed */}
        </motion.div>
        <motion.div
          drag="x"
          dragConstraints={{
            left: 0,
            right: containerWidth > 0 ? containerWidth - THUMB_DIAMETER - PADDING * 2 : 0,
          }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{
            x,
            width: `${THUMB_DIAMETER}px`,
            height: `${THUMB_DIAMETER}px`,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: isSuccess ? "default" : "grab",
            position: "absolute",
            left: `${PADDING}px`,
            pointerEvents: isSuccess ? "none" : "auto",
            zIndex: 10,
            boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
          }}
          whileTap={isSuccess ? {} : { cursor: "grabbing" }}
        >
          <div style={{ color: actionType === "SELL" ? "#DF514C" : "#4184F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isSuccess ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <ChevronRight size={22} strokeWidth={2.5} />}
          </div>
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
        className={`hidden md:flex w-full h-11 rounded-sm items-center justify-center transition-opacity hover:opacity-90 ${colorClass} text-white font-medium uppercase tracking-[0.5px] text-[13px] md:text-[14px]`}
      >
        {isSuccess ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          text.replace("SWIPE TO", "")
        )}
      </button>
    </div>
  );
}
