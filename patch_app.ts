import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [currentView, setCurrentView] = useState<View>("dashboard");',
  `const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return "data-analysis";
    }
    return "dashboard";
  });`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Success App Patch");
