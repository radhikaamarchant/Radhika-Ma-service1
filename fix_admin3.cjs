const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// The first card contains both personal info and bank details right now.
// The end of the personal info section before bank details:

content = content.replace(
  /<div className="pt-5 md:pt-6 border-t border-gray-100">\s*<h3 className="text-\[13px\] md:text-sm font-medium text-gray-800 tracking-tight mb-3 md:mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" \/> Bank Account Details<\/h3>/g,
  `</div>\n</div>\n</div>\n\n<div className="bg-white md:rounded-sm border-b md:border border-gray-200 md:border-kite-border px-4 py-6 md:p-6 md:shadow-sm mt-2 md:mt-0">\n<h3 className="text-[13px] md:text-sm font-medium text-gray-800 tracking-tight mb-3 md:mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" /> Bank Account Details</h3>`
);

content = content.replace(
  /<div className="pt-5 md:pt-6 border-t border-gray-100">\s*<h3 className="text-\[13px\] md:text-sm font-medium text-gray-800 tracking-tight mb-3 md:mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" \/> Bank Account<\/h3>/g,
  `</div>\n</div>\n</div>\n\n<div className="bg-white md:rounded-sm border-b md:border border-gray-200 md:border-kite-border px-4 py-6 md:p-6 md:shadow-sm mt-2 md:mt-0">\n<h3 className="text-[13px] md:text-sm font-medium text-gray-800 tracking-tight mb-3 md:mb-4 flex items-center"><BadgeCheck className="w-4 h-4 mr-1 text-kite-blue" /> Bank Account</h3>`
);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
console.log("Separated Bank Details into own card");
