const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

// Add visibleCount state and observer ref
const stateInsertion = `  const [activeTab, setActiveTab] = useState<"holding" | "booked">("holding");
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
  }, []);
`;

code = code.replace(/const \[activeTab, setActiveTab\] = useState<"holding" \| "booked">("holding");/, stateInsertion);

// Modify the map to slice by visibleCount and add the observerTarget div
const mapRegex = /\{groupedInvestments\.map\(\(inv, idx\) => \{/;
const mapReplacement = `{groupedInvestments.slice(0, visibleCount).map((inv, idx) => {`;
code = code.replace(mapRegex, mapReplacement);

// We need to add the observer target at the end of the list.
// The list ends right before `{groupedInvestments.length === 0 && (`
const targetRegex = /\{""\}\s*\{groupedInvestments\.length === 0 && \(/;
const targetReplacement = `{groupedInvestments.length > visibleCount && (
            <div ref={observerTarget} className="h-10 w-full" />
          )}
          {""}
          {groupedInvestments.length === 0 && (`

code = code.replace(targetRegex, targetReplacement);

// Also, we need to pass visibleCount into the renderedList useMemo dependencies.
const useMemoRegex = /const renderedList = useMemo\(\(\) => \{/;
const useMemoReplacement = `const renderedList = useMemo(() => {`;
// Actually, I should update the dependency array at the end of the useMemo.
// Let's find the closing of useMemo for renderedList.
const depsRegex = /\}\), \[groupedInvestments, state\.businesses, state\.investors, marketState\.trends, state\.settings, blueTickBusinessIds\]\);/;
const depsReplacement = `}), [groupedInvestments, state.businesses, state.investors, marketState.trends, state.settings, blueTickBusinessIds, visibleCount]);`;
code = code.replace(depsRegex, depsReplacement);

fs.writeFileSync('src/pages/Investments.tsx', code);
