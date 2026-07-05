import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

const regex = /@media\s+\(min-width:\s*768px\)\s*\{\s*:root\.dark\s*\{([\s\S]*?)\}\s*\}/g;

content = content.replace(regex, `@media (min-width: 768px) {
    :root.dark {
      --body-bg: #171717;
      --sidebar-bg: #171717;
      --surface-color: #1A1A1A;
      --header-bg: #171717;
      --bg-color-alt: #1C1C1C;
      
      --bg-hover: #202020;
      
      --border-color: #303030;
      --border-color-soft: #2A2A2A;
      --border-color-hard: #303030;
      
      --text-color: #E3E3E3;
      --text-light-color: #BDBDBD;
      --text-muted-color: #8A8A8A;
      
      --color-kite-blue: #387ED1;
      --color-kite-green: #4CAF50;
      --color-kite-red: #EF5350;
      
      --accent-orange: #FF6D2D;
      
      --search-bg: #161616;
      --search-placeholder: #7A7A7A;
    }
  }`);

fs.writeFileSync('src/index.css', content);
console.log("Success replacing desktop variables");
