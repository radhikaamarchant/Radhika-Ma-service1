const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldStyle = `<style>{\`
                  @media (max-width: 767px) {
                    .mobile-header-safe {
                      display: none !important;
                    }
                  }
                \`}</style>`;

const newStyle = `<style>{\`
                  @media (max-width: 767px) {
                    body[data-current-view="investors"] .mobile-header-safe {
                      display: none !important;
                    }
                  }
                \`}</style>`;

content = content.replace(oldStyle, newStyle);
fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Updated Investors.tsx style");
