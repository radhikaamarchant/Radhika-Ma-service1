const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const oldExpandedSection = /<div className="grid grid-cols-12 gap-6">\s*<div className="col-span-8 flex flex-col">\s*<span className="text-kite-text-light text-\[11px\] font-normal">Business owner description<\/span>\s*<span className="text-kite-text text-\[12px\] font-normal mt-0\.5">\{business\.description \|\| "No description provided for this business owner\."\}<\/span>\s*<\/div>\s*<div className="col-span-4 flex flex-col border-l border-kite-vertical-divider pl-6">\s*<span className="text-kite-text-light text-\[11px\] font-normal">Business owner location<\/span>\s*<span className="text-kite-text text-\[12px\] font-normal mt-0\.5">\{business\.location \|\| "Not specified"\}<\/span>\s*<\/div>\s*<\/div>/;

const newExpandedSection = `<div className="grid grid-cols-12 gap-6">
                                  <div className="col-span-8 flex flex-col">
                                    <span className="text-kite-text-light text-[11px] font-normal">Details</span>
                                    <span className="text-kite-text text-[14px] font-medium mt-0.5">{business.description || "No description provided for this business owner."}</span>
                                  </div>
                                  <div className="col-span-4 flex flex-col border-l border-kite-vertical-divider pl-6">
                                    <span className="text-kite-text-light text-[11px] font-normal">Address</span>
                                    <span className="text-kite-text text-[14px] font-medium mt-0.5">{business.location || "Not specified"}</span>
                                  </div>
                                </div>`;

content = content.replace(oldExpandedSection, newExpandedSection);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched final refinements");
