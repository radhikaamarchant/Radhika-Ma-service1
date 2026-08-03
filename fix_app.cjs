const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const insertPoint = `function MainLayout() {\n  const [currentView, setCurrentView] = useState<View>(() => {`;
const insertReplacement = `function MainLayout() {\n  const [currentView, setCurrentView] = useState<View>(() => {\n    if (typeof window !== 'undefined' && window.innerWidth < 768) {\n      return "data-analysis";\n    }\n    return "dashboard";\n  });\n\n  useEffect(() => {\n    document.body.setAttribute("data-current-view", currentView);\n  }, [currentView]);`;

const oldState = `function MainLayout() {\n  const [currentView, setCurrentView] = useState<View>(() => {\n    if (typeof window !== 'undefined' && window.innerWidth < 768) {\n      return "data-analysis";\n    }\n    return "dashboard";\n  });`;

content = content.replace(oldState, insertReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
