const fs = require('fs');

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashboard = dashboard.replace(
  /<div className="w-10 h-10 rounded-sm bg-kite-blue flex-shrink-0 text-white flex items-center justify-center font-medium text-xs md:text-base-inner">/g,
  '<div className="w-10 h-10 rounded-full bg-[#f0f6fc] dark:bg-kite-blue/20 flex-shrink-0 text-kite-blue dark:text-[#7ab0ea] flex items-center justify-center font-medium text-lg">'
);

dashboard = dashboard.replace(
  /<div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 text-black flex items-center justify-center font-medium text-sm">/g,
  '<div className="w-8 h-8 rounded-full bg-[#f0f6fc] dark:bg-kite-blue/20 flex-shrink-0 text-kite-blue dark:text-[#7ab0ea] flex items-center justify-center font-medium text-sm">'
);

dashboard = dashboard.replace(
  /<div className="w-8 h-8 rounded-full bg-kite-blue\/10 flex-shrink-0 text-kite-blue flex items-center justify-center font-medium text-sm">/g,
  '<div className="w-8 h-8 rounded-full bg-[#f0f6fc] dark:bg-kite-blue/20 flex-shrink-0 text-kite-blue dark:text-[#7ab0ea] flex items-center justify-center font-medium text-sm">'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

let dataAnalysis = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

dataAnalysis = dataAnalysis.replace(
  /<div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-medium text-\[10px\] \${statsMap\.get\(b\.id\)\?\.isBlueTick \? 'bg-kite-blue\/10 text-kite-blue' : statsMap\.get\(b\.id\)\?\.isPreVerified \? 'bg-white text-kite-text' : 'bg-kite-bg text-kite-text'}`}>/g,
  '<div className="w-8 h-8 rounded-full bg-[#f0f6fc] dark:bg-kite-blue/20 flex-shrink-0 text-kite-blue dark:text-[#7ab0ea] flex items-center justify-center font-medium text-[13px]">'
);

// Add avatar for mobile list in DataAnalysis
dataAnalysis = dataAnalysis.replace(
  /<div className="flex items-center space-x-1.5 min-w-0 pr-2">/g,
  `<div className="flex items-center space-x-2 min-w-0 pr-2">
      <div className="w-6 h-6 rounded-full bg-[#f0f6fc] dark:bg-kite-blue/20 flex-shrink-0 text-kite-blue dark:text-[#7ab0ea] flex items-center justify-center font-medium text-[10px]">
        {b.name.charAt(0)}
      </div>`
);

fs.writeFileSync('src/pages/DataAnalysis.tsx', dataAnalysis);

console.log("Done");
