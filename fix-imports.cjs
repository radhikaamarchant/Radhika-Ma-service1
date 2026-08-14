const fs = require('fs');

let daCode = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');
daCode = daCode.replace(
  'import React, { useState, useEffect } from"react";',
  'import React, { useState, useEffect, useMemo, useDeferredValue } from "react";'
);
fs.writeFileSync('src/pages/DataAnalysis.tsx', daCode);

let invCode = fs.readFileSync('src/pages/Investments.tsx', 'utf8');
invCode = invCode.replace(
  'import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from"react";',
  'import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useDeferredValue } from "react";'
);
fs.writeFileSync('src/pages/Investments.tsx', invCode);

