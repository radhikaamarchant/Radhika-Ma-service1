const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

if (!content.includes('import { createPortal }')) {
  content = content.replace('import React', 'import React, { useMemo, useState } from "react";\nimport { createPortal } from "react-dom"');
  // cleanup just in case there's duplicate
  content = content.replace(/import React, \{ useMemo, useState \} from "react";\nimport \{ createPortal \} from "react-dom";?\nimport React, \{ useState, useMemo, useEffect, useRef \} from "react";/, 'import React, { useState, useMemo, useEffect, useRef } from "react";\nimport { createPortal } from "react-dom";');
}

if (!content.includes('createPortal(')) {
  content = content.replace(
    '<LivePortfolioDetail',
    '{createPortal(<LivePortfolioDetail'
  );
  content = content.replace(
    'onBuyClick={onBuyClick}\n        />',
    'onBuyClick={onBuyClick}\n        />, document.body)}'
  );
}

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
