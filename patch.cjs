const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessSidebar.tsx', 'utf8');

if (!code.includes('useTheme')) {
  code = code.replace(
    'import { useAppContext } from "../utils/AppContext";',
    'import { useAppContext } from "../utils/AppContext";\nimport { useTheme } from "../utils/ThemeContext";'
  );
}

// Modify LiveSidebarValue
code = code.replace(
  'const LiveSidebarValue = ({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {',
  'const LiveSidebarValue = ({ name, baseAmount, roi, overallTrend, isOpen }: { name: string; baseAmount: number; roi: number; overallTrend: number; isOpen: boolean }) => {\n  const { isDark } = useTheme();'
);

code = code.replace(
  /const upColorHex = "#5B9A5D";\s*const downColorHex = "#E25F5B";/,
  `const upColorHex = isDark ? "#5B9A5D" : "#4CAF50";\n  const downColorHex = isDark ? "#E25F5B" : "#DF514C";\n  const absColorHex = isDark ? "#666666" : "#9B9B9B";\n  const pctColorHex = isDark ? "#BBBBBBD9" : "#444444D9";`
);

code = code.replace(
  /style={{ color: '#666666' }}/,
  `style={{ color: absColorHex }}`
);

code = code.replace(
  /style={{ color: '#BBBBBBD9' }}/,
  `style={{ color: pctColorHex }}`
);

fs.writeFileSync('src/components/BusinessSidebar.tsx', code);
