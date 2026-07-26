const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldScrollBlock = `  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      if (viewMode === "list") {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

  useLayoutEffect(() => {
    if (viewMode === "list") {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [viewMode]);`;

const newScrollBlock = `  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);
  const viewModeRef = useRef<ViewMode>(viewMode);
  
  // Keep viewModeRef up to date immediately during render
  viewModeRef.current = viewMode;

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      if (viewModeRef.current === "list") {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (viewMode === "list") {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [viewMode]);`;

if (content.includes(oldScrollBlock)) {
  content = content.replace(oldScrollBlock, newScrollBlock);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Replaced scroll logic in Investors");
} else {
  console.log("Could not find old scroll block exactly");
}
