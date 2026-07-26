const fs = require('fs');
let content = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const oldScrollBlock = `  const dragRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    mainRef.current = mainEl;
    if (!mainEl) return;
    
    const handleScroll = () => {
      const isList = !showAddForm && !selectedInvestment;
      if (isList) {
        scrollPosRef.current = mainEl.scrollTop;
      }
    };
    
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [showAddForm, selectedInvestment]);

  useLayoutEffect(() => {
    const isList = !showAddForm && !selectedInvestment;
    if (isList) {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [showAddForm, selectedInvestment]);`;

const newScrollBlock = `  const dragRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement | null>(null);
  
  const isListRef = useRef<boolean>(!showAddForm && !selectedInvestment);
  isListRef.current = !showAddForm && !selectedInvestment;

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
    const isList = !showAddForm && !selectedInvestment;
    if (isList) {
      if (mainRef.current) {
        mainRef.current.scrollTop = scrollPosRef.current;
      }
    } else {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [showAddForm, selectedInvestment]);`;

if (content.includes(oldScrollBlock)) {
  content = content.replace(oldScrollBlock, newScrollBlock);
  fs.writeFileSync('src/pages/Investments.tsx', content);
  console.log("Replaced scroll logic in Investments");
} else {
  console.log("Could not find old scroll block exactly in Investments");
}
