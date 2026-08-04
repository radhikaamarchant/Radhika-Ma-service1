import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const target = `  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });`;

const replacement = `  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/config", (req, res) => {
    res.json({ GOOGLE_MAPS_PLATFORM_KEY: process.env.GOOGLE_MAPS_PLATFORM_KEY || '' });
  });`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content, 'utf8');
console.log('server.ts patched!');
