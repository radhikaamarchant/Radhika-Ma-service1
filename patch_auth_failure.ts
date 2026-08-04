import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  useEffect(() => {
    fetch('/api/config')`;

const replace = `  useEffect(() => {
    // Suppress Google Maps authentication failure alert
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failed. Places autocomplete will gracefully degrade to a standard text input.");
    };

    fetch('/api/config')`;

content = content.replace(target, replace);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App patched with gm_authFailure!');
