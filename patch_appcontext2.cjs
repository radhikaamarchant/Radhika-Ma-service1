const fs = require('fs');

const code = fs.readFileSync('src/utils/AppContext.tsx', 'utf8');

const updatedCode = code.replace(/return s\.businesses !== newBusinesses \? \{ \.\.\.s, businesses: newBusinesses, loading: false \} : \{ \.\.\.s, loading: false \};/g, 
  `if (s.businesses !== newBusinesses || s.loading !== false) {
          return { ...s, businesses: newBusinesses, loading: false };
        }
        return s;`)
.replace(/return s\.investors !== newInvestors \? \{ \.\.\.s, investors: newInvestors \} : s;/g,
  `if (s.investors !== newInvestors) {
          return { ...s, investors: newInvestors };
        }
        return s;`)
.replace(/return s\.investments !== newInvestments \? \{ \.\.\.s, investments: newInvestments \} : s;/g,
  `if (s.investments !== newInvestments) {
          return { ...s, investments: newInvestments };
        }
        return s;`)
.replace(/return JSON\.stringify\(s\.settings\) !== JSON\.stringify\(data\) \? \{ \.\.\.s, settings: data \} : s;/g,
  `if (JSON.stringify(s.settings) !== JSON.stringify(data)) {
            return { ...s, settings: data };
          }
          return s;`)
.replace(/return s\.users !== newUsers \? \{ \.\.\.s, users: newUsers \} : s;/g,
  `if (s.users !== newUsers) {
          return { ...s, users: newUsers };
        }
        return s;`);

fs.writeFileSync('src/utils/AppContext.tsx', updatedCode);
