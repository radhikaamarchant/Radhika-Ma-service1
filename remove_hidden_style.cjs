const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const targetStyle = `<style>{\`
                  @media (max-width: 767px) {
                    body[data-current-view="investors"] .mobile-header-safe {
                      display: none !important;
                    }
                  }
                \`}</style>`;

content = content.replace(targetStyle, "");
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Removed hiding of mobile-header-safe from Investors");
