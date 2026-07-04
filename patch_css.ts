import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf8');

// Remove the old bad CSS
css = css.replace(
  /body\.is-popping \.fixed\.inset-0,[\s\S]*?transition: none !important;\n}/g,
  ''
);

css = css.replace(
  /body\.is-popping \* {[\s\S]*?animation-duration: 0ms !important;\n}/g,
  ''
);

// Add specific modal hiding
css += `
/* Force modals to disappear immediately on swipe back to prevent visual jerk */
body.is-popping .fixed.inset-0 {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  transition: none !important;
}

/* Ensure header and nav bars don't disappear */
body.is-popping .fixed.top-0,
body.is-popping .fixed.bottom-0 {
  opacity: 1 !important;
  visibility: visible !important;
}
`;

fs.writeFileSync('src/index.css', css);
console.log("Success CSS Patch");
