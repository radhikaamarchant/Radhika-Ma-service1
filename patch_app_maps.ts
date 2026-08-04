import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import {  MarketSimulationProvider,  useMarketSimulation,} from "./utils/MarketSimulationContext";`;
const importReplacement = `import {  MarketSimulationProvider,  useMarketSimulation,} from "./utils/MarketSimulationContext";
import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
`;

content = content.replace(importTarget, importReplacement);

const returnTarget = `  return (
    <AppProvider>
      <MarketSimulationProvider>
        <AuthWrapper />
      </MarketSimulationProvider>
    </AppProvider>
  );`;

const returnReplacement = `  return (
    <AppProvider>
      <MarketSimulationProvider>
        <APIProvider apiKey={API_KEY} version="weekly">
          <AuthWrapper />
        </APIProvider>
      </MarketSimulationProvider>
    </AppProvider>
  );`;

content = content.replace(returnTarget, returnReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx patched for Maps');
