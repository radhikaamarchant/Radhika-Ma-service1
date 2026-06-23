import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Fix the Icon className syntax error
content = content.replace(/<Icon className=\{`w-3\.5 h-3\.5 md:w-4 md:h-4 \$\{isActive \? 'text-blue-500' : 'text-gray-500'\} \/>/g, "<Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />");

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
