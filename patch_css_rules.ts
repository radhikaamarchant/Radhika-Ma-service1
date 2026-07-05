import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

const newDesktopRules = `
  @media (min-width: 768px) {
    .dark button:disabled, 
    .dark input:disabled,
    .dark .disabled\\:opacity-70:disabled {
      background-color: #2A2A2A !important;
      color: #666666 !important;
      opacity: 1 !important;
    }

    .dark input[type="text"][placeholder*="Search"],
    .dark input[type="text"][placeholder*="search"],
    .dark .bg-kite-surface input[placeholder*="Search"] {
      background-color: var(--search-bg) !important;
    }
    
    .dark input[placeholder*="Search"]::placeholder,
    .dark input[placeholder*="search"]::placeholder {
      color: var(--search-placeholder) !important;
    }
  }
`;

content += newDesktopRules;

fs.writeFileSync('src/index.css', content);
console.log("Success rules patch desktop");
