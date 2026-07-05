const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

content = content.replace(
  /\s*\}\}\s*\/>\s*\)\}\s*\{""\}\s*\{withdrawStep === 1 && \(/,
  `
  }}
>
  EXIT
</button>
</motion.div>
</>
)}
</AnimatePresence>
</div>
)}
</div>
</div>
{withdrawStep === 1 && (`
);
fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Fixed syntax 2");
