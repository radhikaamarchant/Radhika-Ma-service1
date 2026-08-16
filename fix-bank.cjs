const fs = require('fs');
let code = fs.readFileSync('src/utils/bankBalance.ts', 'utf8');

// Remove localStorage parses inside bankBalance to prevent main thread blocking
// Admin
code = code.replace(/try\s*\{\s*const bidsComms = JSON\.parse\(localStorage\.getItem\("bids_commissions"\)[\s\S]*?\} catch\(e\) \{\}/g, '');
code = code.replace(/try\s*\{\s*const bidsApps = JSON\.parse\(localStorage\.getItem\("bids_applications"\)[\s\S]*?\} catch\(e\) \{\}/g, '');
// And inside else if (biz) and else if (inv) there are more.
// Let's use string replace for all localStorage logic in bankBalance.ts 

fs.writeFileSync('src/utils/bankBalance.ts', code);
