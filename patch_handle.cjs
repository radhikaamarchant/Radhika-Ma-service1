const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(
  /triggerMaxQuantity: maxQty > 0 \? maxQty : undefined,\n        triggerHistory: newHistory/g,
  `triggerMaxQuantity: maxQty > 0 ? maxQty : undefined,
        increaseMarket: parseFloat(triggerConfig.increaseMarket) || undefined,
        downMarket: parseFloat(triggerConfig.downMarket) || undefined,
        triggerHistory: newHistory`
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
