const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('AuthWrapper')) {
  appContent = appContent.replace(
    'export default function App() {',
    'import { AuthWrapper } from "./components/AuthWrapper";\n\nexport default function App() {'
  );

  appContent = appContent.replace(
    '<AppProvider>',
    '<AuthWrapper>\n      <AppProvider>'
  );

  appContent = appContent.replace(
    '</AppProvider>',
    '</AppProvider>\n    </AuthWrapper>'
  );

  fs.writeFileSync('src/App.tsx', appContent);
  console.log('App.tsx patched');
}
