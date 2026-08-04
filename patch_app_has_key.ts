import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetReturn = `  return (
    <AppProvider>
      <MarketSimulationProvider>
        <APIProvider apiKey={API_KEY} version="weekly">
          <AuthWrapper />
        </APIProvider>
      </MarketSimulationProvider>
    </AppProvider>
  );
}`;

const replacementReturn = `  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2>Google Maps API Key Required</h2>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8'}}>
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p>The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <MarketSimulationProvider>
        <APIProvider apiKey={API_KEY} version="weekly">
          <AuthWrapper />
        </APIProvider>
      </MarketSimulationProvider>
    </AppProvider>
  );
}`;

content = content.replace(targetReturn, replacementReturn);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Done!');
