const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');
content = content.replace(/^.*import InvestorPreviewModal/s, 'import { useMobileBackNavigation } from "../hooks/useMobileBackNavigation";\nimport { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";\nimport React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";\nimport { createPortal } from "react-dom";\nimport InvestorPreviewModal');
fs.writeFileSync('src/pages/Investors.tsx', content);
