const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(
  /maxQuantity: business\?\.triggerMaxQuantity \? new Intl\.NumberFormat\('en-IN'\)\.format\(business\.triggerMaxQuantity\) : "",/g,
  `maxQuantity: business?.triggerMaxQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMaxQuantity) : "",
    increaseMarket: business?.increaseMarket?.toString() || "",
    downMarket: business?.downMarket?.toString() || "",`
);

code = code.replace(
  /maxQuantity: business\.triggerMaxQuantity \? new Intl\.NumberFormat\('en-IN'\)\.format\(business\.triggerMaxQuantity\) : "",/g,
  `maxQuantity: business.triggerMaxQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMaxQuantity) : "",
        increaseMarket: business.increaseMarket?.toString() || "",
        downMarket: business.downMarket?.toString() || "",`
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
