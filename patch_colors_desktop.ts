import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

const replacement = `  @media (min-width: 768px) {
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
    }
  }`;

content = content.replace(
  /  @media \(min-width: 768px\) \{\n    :root\.dark \{[\s\S]*?\}  \}/,
  replacement
);

fs.writeFileSync('src/index.css', content);
console.log("Success colors patch desktop");
