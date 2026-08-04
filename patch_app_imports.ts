import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const importReplacement = `import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

function GlobalMarketAlerts() {`;

content = content.replace("function GlobalMarketAlerts() {", importReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched for imports');
