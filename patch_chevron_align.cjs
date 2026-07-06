const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const oldRegex = /<div className="w-\[30%\] text-left py-3 flex items-center overflow-hidden pr-2">\s*<span className="font-normal text-kite-text text-\[13px\] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">\s*\{business\.shortName \? business\.shortName\.toUpperCase\(\) : business\.name\?\.toUpperCase\(\)\}\s*<\/span>\s*\{isBlueTick\(business\.id\) && \(\s*<BadgeCheck className="w-3\.5 h-3\.5 text-white fill-blue-500 flex-shrink-0 ml-1\.5" \/>\s*\)\}\s*\{isPreVerified\(business\.id\) && \(\s*<Clock className="w-3 h-3 text-kite-text flex-shrink-0 ml-1\.5" \/>\s*\)\}\s*<button\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setExpandedBusinessId\(expandedBusinessId === business\.id \? null : business\.id\);\s*\}\}\s*className=\{\`ml-2 focus:outline-none flex-shrink-0 flex items-center justify-center p-0\.5 rounded transition-all hover:bg-gray-100 dark:hover:bg-\[\#202020\] \$\{expandedBusinessId === business\.id \? 'opacity-100' : 'opacity-0 group-hover:opacity-100'\}\`\}\s*>\s*<ChevronDown className=\{\`w-\[14px\] h-\[14px\] text-kite-text-light transition-transform duration-300 \$\{expandedBusinessId === business\.id \? "rotate-180" : ""\}\`\} \/>\s*<\/button>\s*<\/div>/;

const newReplacement = `<div className="w-[30%] text-left py-3 flex items-center justify-between overflow-hidden pr-4">
                            <div className="flex items-center overflow-hidden flex-1">
                              <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                                {business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}
                              </span>
                              {isBlueTick(business.id) && (
                                <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0 ml-1.5" />
                              )}
                              {isPreVerified(business.id) && (
                                <Clock className="w-3 h-3 text-kite-text flex-shrink-0 ml-1.5" />
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id);
                              }}
                              className={\`ml-4 focus:outline-none flex-shrink-0 flex items-center justify-center p-0.5 rounded transition-all hover:bg-gray-100 dark:hover:bg-[#202020] \${expandedBusinessId === business.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`}
                            >
                              <ChevronDown className={\`w-[14px] h-[14px] text-kite-text-light transition-transform duration-300 \${expandedBusinessId === business.id ? "rotate-180" : ""}\`} />
                            </button>
                          </div>`;

content = content.replace(oldRegex, newReplacement);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched chevron alignment");
