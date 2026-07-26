const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// The first block
const firstBlock = `  const listScrollPos = useRef(0);
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

if (content.includes(firstBlock)) {
  content = content.replace(firstBlock, "");
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("Removed first block");
} else {
  console.log("First block not found exactly as expected");
}
