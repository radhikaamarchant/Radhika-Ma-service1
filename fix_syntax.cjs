const fs = require('fs');
let content = fs.readFileSync('src/components/LivePortfolioDetail.tsx', 'utf8');

const brokenPart = `    }
  }}            />          )}
          {""}
          {withdrawStep === 1 && (`;

const fixedPart = `    }
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
{withdrawStep === 1 && (`;

content = content.replace(brokenPart, fixedPart);
fs.writeFileSync('src/components/LivePortfolioDetail.tsx', content);
console.log("Fixed syntax");
