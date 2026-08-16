const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const target = '  const [activeTab, setActiveTab] = useState<"holding" | "booked">("holding");';
const injection = `  const [activeTab, setActiveTab] = useState<"holding" | "booked">("holding");
  const [visibleCount, setVisibleCount] = useState(50);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(50);
  }, [deferredSearchTerm, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, []);`;

code = code.replace(target, injection);
fs.writeFileSync('src/pages/Investments.tsx', code);
