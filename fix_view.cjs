const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('data-current-view')) {
  // Find useEffect and add one for data-current-view
  const importReact = `import { useState, useEffect } from "react";`;
  if (content.includes(importReact)) {
    // already there
  }
  
  const insertPoint = `function App() {\n  const [currentView, setCurrentView] = useState<View>("data-analysis");`;
  const insertReplacement = `function App() {\n  const [currentView, setCurrentView] = useState<View>("data-analysis");\n\n  useEffect(() => {\n    document.body.setAttribute("data-current-view", currentView);\n  }, [currentView]);`;
  
  content = content.replace(insertPoint, insertReplacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Updated App.tsx");
}
