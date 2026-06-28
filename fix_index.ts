import fs from 'fs';

let text = fs.readFileSync('src/index.css', 'utf8');

text = text.replace(/\.bg-white, \.dark\\:bg-kite-surface {/g, '.dark .bg-white, .dark .dark\\:bg-kite-surface {');
text = text.replace(/\.bg-gray-50, \.bg-gray-100, \.dark\\:bg-kite-bg {/g, '.dark .bg-gray-50, .dark .bg-gray-100, .dark .dark\\:bg-kite-bg {');
text = text.replace(/\.hover\\:bg-gray-50:hover, \.hover\\:bg-gray-100:hover, \.dark\\:hover\\:bg-kite-surface:hover, \.hover\\:bg-kite-bg:hover, \.group:hover \.group-hover\\:bg-gray-50 {/g, '.dark .hover\\:bg-gray-50:hover, .dark .hover\\:bg-gray-100:hover, .dark .dark\\:hover\\:bg-kite-surface:hover, .dark .hover\\:bg-kite-bg:hover, .dark .group:hover .group-hover\\:bg-gray-50 {');

text = text.replace(/header, \.header, \.top-nav {/g, '.dark header, .dark .header, .dark .top-nav {');
text = text.replace(/\.sidebar-container, \.sidebar-container > div {/g, '.dark .sidebar-container, .dark .sidebar-container > div {');
text = text.replace(/\.main-container {/g, '.dark .main-container {');

text = text.replace(/\.border, \.border-b, \.border-t, \.border-r, \.border-l, \.border-y, \.border-x, \n  \.border-kite-border, \.border-gray-100, \.border-gray-200, \.border-gray-300 {/g, '.dark .border, .dark .border-b, .dark .border-t, .dark .border-r, .dark .border-l, .dark .border-y, .dark .border-x, \n  .dark .border-kite-border, .dark .border-gray-100, .dark .border-gray-200, .dark .border-gray-300 {');

text = text.replace(/\.shadow-sm, \.shadow-md, \.shadow-lg, \.shadow-xl, \.shadow-2xl, \.shadow-\[.*\] {/g, '.dark .shadow-sm, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl, .dark .shadow-2xl, .dark .shadow-\\[.*\\] {');

text = text.replace(/\.text-gray-900, \.text-black, \.text-gray-800, \.text-kite-text {/g, '.dark .text-gray-900, .dark .text-black, .dark .text-gray-800, .dark .text-kite-text {');
text = text.replace(/\.text-gray-600, \.text-gray-500, \.text-gray-400, \.text-kite-text-light {/g, '.dark .text-gray-600, .dark .text-gray-500, .dark .text-gray-400, .dark .text-kite-text-light {');
text = text.replace(/\.text-gray-400, \.text-gray-500 {/g, '.dark .text-gray-400, .dark .text-gray-500 {');

text = text.replace(/\.text-green-500, \.text-green-600, \.text-green-400, \.text-kite-green, \.text-emerald-500 {/g, '.dark .text-green-500, .dark .text-green-600, .dark .text-green-400, .dark .text-kite-green, .dark .text-emerald-500 {');
text = text.replace(/\.text-red-500, \.text-red-600, \.text-red-400, \.text-kite-red {/g, '.dark .text-red-500, .dark .text-red-600, .dark .text-red-400, .dark .text-kite-red {');
text = text.replace(/\.text-kite-blue {/g, '.dark .text-kite-blue {');
text = text.replace(/\.border-kite-blue {/g, '.dark .border-kite-blue {');

text = text.replace(/input, select, textarea {/g, '.dark input, .dark select, .dark textarea {');
text = text.replace(/input::placeholder, textarea::placeholder {/g, '.dark input::placeholder, .dark textarea::placeholder {');

fs.writeFileSync('src/index.css', text);
