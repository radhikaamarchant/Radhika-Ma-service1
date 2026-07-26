const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

if (!content.includes('import { createPortal }')) {
  content = content.replace('import React', 'import React, { useMemo, useState } from "react";\nimport { createPortal } from "react-dom"');
  // cleanup just in case there's duplicate
  content = content.replace(/import React, \{ useMemo, useState \} from "react";\nimport \{ createPortal \} from "react-dom";?\nimport React, \{ useState, useMemo, useEffect, useRef, useLayoutEffect \} from "react";/, 'import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";\nimport { createPortal } from "react-dom";');
}

if (content.includes('<LivePortfolioDetail')) {
  content = content.replace(
    /\{\s*selectedPortfolioInvestment\s*&&\s*\(\s*<LivePortfolioDetail\s*selectedInvestment=\{selectedPortfolioInvestment\}\s*onClose=\{\(\)\s*=>\s*setSelectedPortfolioInvestment\(null\)\}\s*\/>\s*\)\}/g,
    '{selectedPortfolioInvestment && createPortal(<LivePortfolioDetail selectedInvestment={selectedPortfolioInvestment} onClose={() => setSelectedPortfolioInvestment(null)} />, document.body)}'
  );
}

fs.writeFileSync('src/pages/Investors.tsx', content);
