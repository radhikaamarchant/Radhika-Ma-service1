const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

code = code.replace(
  '    };\n  });\n  const topInvested = isDesktop',
  '    };\n  }), [state.businesses, state.investments, marketState.trends, state.settings]);\n  const topInvested = isDesktop'
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
