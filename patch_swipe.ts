import fs from 'fs';
let code = fs.readFileSync('src/components/SwipeButton.tsx', 'utf8');

code = code.replace(
  'transition: { type: "spring", bounce: 0.2, duration: 0.4 },',
  'transition: { type: "tween", ease: "easeOut", duration: 0.2 },'
);

fs.writeFileSync('src/components/SwipeButton.tsx', code);
console.log("Success Swipe Patch");
