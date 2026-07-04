import fs from 'fs';
let code = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf8');

code = code.replace(
  `import { useAppContext } from "../utils/AppContext";`,
  `import { useAppContext } from "../utils/AppContext";\nimport { triggerSelectionHaptic } from "../utils/haptics";`
);

code = code.replace(
  `onClick={() => onNavigate(item.id)}`,
  `onClick={() => {
              triggerSelectionHaptic();
              onNavigate(item.id);
            }}`
);

fs.writeFileSync('src/components/MobileBottomNav.tsx', code);
console.log("Success Nav Patch");
