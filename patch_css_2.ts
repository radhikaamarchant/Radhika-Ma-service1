import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf8');

css += `
body.is-popping .absolute.inset-0.z-50,
body.is-popping .fixed.inset-0.z-\\[110\\] {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  transition: none !important;
}
`;

fs.writeFileSync('src/index.css', css);
console.log("Success CSS Patch 2");
