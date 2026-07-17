const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

code = code.replace(
  /if \(business\) \{\n      setFormData\(\{/g,
  `if (business) {
      setTriggerConfig({
        type: business.investmentType || 'manual',
        amount: business.triggerAmount ? new Intl.NumberFormat('en-IN').format(business.triggerAmount) : "",
        minQuantity: business.triggerMinQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMinQuantity) : "",
        maxQuantity: business.triggerMaxQuantity ? new Intl.NumberFormat('en-IN').format(business.triggerMaxQuantity) : "",
        increaseMarket: business.increaseMarket?.toString() || "",
        downMarket: business.downMarket?.toString() || "",
      });
      setFormData({`
);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
