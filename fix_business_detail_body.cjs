const fs = require('fs');
let content = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [businessId]);`;

const replacementEffect = `  useEffect(() => {
    document.body.classList.add('business-detail-open');
    return () => document.body.classList.remove('business-detail-open');
  }, []);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [businessId]);`;

content = content.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/components/BusinessDetail.tsx', content);
console.log("Added body class to BusinessDetail");
