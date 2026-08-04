import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';`;

const replace1 = `import { APIProvider } from '@vis.gl/react-google-maps';

// Key will be fetched at runtime to support deployment environments
let INITIAL_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';`;

content = content.replace(target1, replace1);

const target2 = `export default function App() {
  const isOnline = useOnlineStatus();`;

const replace2 = `export default function App() {
  const isOnline = useOnlineStatus();
  const [apiKey, setApiKey] = useState(INITIAL_API_KEY);
  const [isKeyLoading, setIsKeyLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.GOOGLE_MAPS_PLATFORM_KEY) {
          setApiKey(data.GOOGLE_MAPS_PLATFORM_KEY);
        }
        setIsKeyLoading(false);
      })
      .catch(err => {
        console.error('Error fetching config:', err);
        setIsKeyLoading(false);
      });
  }, []);`;

content = content.replace(target2, replace2);

const target3 = `    );
  }

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  if (!hasValidKey) {`;

const replace3 = `    );
  }

  if (isKeyLoading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif'}}>
        <div>Loading configuration...</div>
      </div>
    );
  }

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY';

  if (!hasValidKey) {`;

content = content.replace(target3, replace3);

const target4 = `  return (
    <AppProvider>
      <MarketSimulationProvider>
        <APIProvider apiKey={API_KEY} version="weekly">`;

const replace4 = `  return (
    <AppProvider>
      <MarketSimulationProvider>
        <APIProvider apiKey={apiKey} version="weekly">`;

content = content.replace(target4, replace4);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App patched for dynamic key!');
