const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const oldButtonRegex = /<button\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setExpandedBusinessId\(expandedBusinessId === business\.id \? null : business\.id\);\s*\}\}\s*className="ml-2 focus:outline-none flex-shrink-0 flex items-center justify-center p-0\.5 rounded opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-\[\#202020\] transition-all"\s*>/;

const newButtonCode = `<button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id);
                              }}
                              className={\`ml-2 focus:outline-none flex-shrink-0 flex items-center justify-center p-0.5 rounded transition-all hover:bg-gray-100 dark:hover:bg-[#202020] \${expandedBusinessId === business.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}
                            >`;

content = content.replace(oldButtonRegex, newButtonCode);

const oldExpandedSection = /<div className="px-4 py-4 flex flex-col gap-3">\s*<div className="grid grid-cols-12 gap-6">\s*<div className="col-span-8 flex flex-col gap-1">\s*<span className="text-kite-text-light text-\[11px\] uppercase tracking-wider font-medium">Business Owner Description<\/span>\s*<span className="text-kite-text text-\[13px\] font-normal leading-relaxed">\{business\.description \|\| "No description provided for this business owner\."\}<\/span>\s*<\/div>\s*<div className="col-span-4 flex flex-col gap-1 border-l border-kite-vertical-divider pl-6">\s*<span className="text-kite-text-light text-\[11px\] uppercase tracking-wider font-medium">Business Owner Location<\/span>\s*<span className="text-kite-text text-\[13px\] font-normal leading-relaxed">\{business\.location \|\| "Not specified"\}<\/span>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newExpandedSection = `<div className="px-4 py-3 flex flex-col">
                                <div className="grid grid-cols-12 gap-6">
                                  <div className="col-span-8 flex flex-col">
                                    <span className="text-kite-text-light text-[11px] font-normal">Business owner description</span>
                                    <span className="text-kite-text text-[12px] font-normal mt-0.5">{business.description || "No description provided for this business owner."}</span>
                                  </div>
                                  <div className="col-span-4 flex flex-col border-l border-kite-vertical-divider pl-6">
                                    <span className="text-kite-text-light text-[11px] font-normal">Business owner location</span>
                                    <span className="text-kite-text text-[12px] font-normal mt-0.5">{business.location || "Not specified"}</span>
                                  </div>
                                </div>
                              </div>`;

content = content.replace(oldExpandedSection, newExpandedSection);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched refinements");
