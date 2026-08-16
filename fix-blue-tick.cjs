const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf8');

const oldBlueTick = `const blueTickBusinessIds = getBlueTickBusinessIds(
    state.businesses,
    state.investments
  );`;

const newBlueTick = `const blueTickBusinessIds = useMemo(() => getBlueTickBusinessIds(
    state.businesses,
    state.investments
  ), [state.businesses, state.investments]);`;

code = code.replace(oldBlueTick, newBlueTick);

fs.writeFileSync('src/pages/Investments.tsx', code);
