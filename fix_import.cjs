const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');
content = content.replace(/^.*import ImageCropModal/s, 'import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";\nimport { createPortal } from "react-dom";\nimport ImageCropModal');
fs.writeFileSync('src/components/InvestorDetail.tsx', content);
