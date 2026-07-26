const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const target = `  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);`;

const replacement = `  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const listScrollPos = useRef(0);
  const prevViewMode = useRef(viewMode);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (prevViewMode.current === "list" && viewMode !== "list") {
      listScrollPos.current = mainEl ? mainEl.scrollTop : 0;
      if (mainEl) mainEl.scrollTop = 0;
    } else if (viewMode === "list" && prevViewMode.current !== "list") {
      if (mainEl) {
        setTimeout(() => {
          mainEl.scrollTop = listScrollPos.current;
        }, 10);
      }
    } else if (prevViewMode.current !== viewMode) {
      if (mainEl) mainEl.scrollTop = 0;
    }
    prevViewMode.current = viewMode;
  }, [viewMode]);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Injected scroll restoration in Investors.tsx");
