const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldScrollBlock = `  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      const isList = viewMode === "list";
      if (isList) {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

  useLayoutEffect(() => {
    const isList = viewMode === "list";
    if (isList) {
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
  
  const isListRef = useRef<boolean>(viewMode === "list");
  isListRef.current = viewMode === "list";

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      if (isListRef.current) {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const isList = viewMode === "list";
    if (isList) {
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
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Replaced scroll logic in Investments");
} else {
  console.log("Could not find old scroll block exactly in Investments");
}
