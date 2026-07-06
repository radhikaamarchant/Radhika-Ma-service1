const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

// 1. Add expandedBusinessId state
if (!content.includes('const [expandedBusinessId')) {
  content = content.replace(
    /const \[ownerSearch, setOwnerSearch\] = useState\(""\);/,
    `const [ownerSearch, setOwnerSearch] = useState("");
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);`
  );
}

// 2. Modify the Desktop View's first column to include the chevron
const desktopCol1Regex = /<div className="w-\[30%\] text-left py-3 flex items-center overflow-hidden">\s*<span className="font-normal text-kite-text text-\[13px\] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">\s*\{business\.shortName \? business\.shortName\.toUpperCase\(\) : business\.name\?\.toUpperCase\(\)\}\s*<\/span>\s*\{isBlueTick\(business\.id\) && \(\s*<BadgeCheck className="w-3\.5 h-3\.5 text-white fill-blue-500 flex-shrink-0 ml-1\.5" \/>\s*\)\}\s*\{isPreVerified\(business\.id\) && \(\s*<Clock className="w-3 h-3 text-kite-text flex-shrink-0 ml-1\.5" \/>\s*\)\}\s*<\/div>/;

const desktopCol1Replacement = `<div className="w-[30%] text-left py-3 flex items-center overflow-hidden pr-2">
                            <span className="font-normal text-kite-text text-[13px] group-hover:text-kite-blue transition-colors uppercase leading-tight tracking-wide truncate">
                              {business.shortName ? business.shortName.toUpperCase() : business.name?.toUpperCase()}
                            </span>
                            {isBlueTick(business.id) && (
                              <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 flex-shrink-0 ml-1.5" />
                            )}
                            {isPreVerified(business.id) && (
                              <Clock className="w-3 h-3 text-kite-text flex-shrink-0 ml-1.5" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id);
                              }}
                              className="ml-2 focus:outline-none flex-shrink-0 flex items-center justify-center p-0.5 rounded opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-[#202020] transition-all"
                            >
                              <ChevronDown className={\`w-[14px] h-[14px] text-kite-text-light transition-transform duration-300 \${expandedBusinessId === business.id ? "rotate-180" : ""}\`} />
                            </button>
                          </div>`;

content = content.replace(desktopCol1Regex, desktopCol1Replacement);

const rowEndRegex = /(<div className="w-\[14%\] text-right py-3 text-\[13px\] font-normal text-kite-text pl-5 border-l border-kite-vertical-divider truncate">\s*\{`₹\$\{formatLargeNumber\(totalInvested\)\}`\}\s*<\/div>\s*<\/div>\s*)(<\/div>\s*\);\s*\})/;

const expandedSection = `
                        {/* Expanded Section (Desktop Only) */}
                        <AnimatePresence>
                          {expandedBusinessId === business.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="hidden md:block overflow-hidden bg-[#FAFBFC] dark:bg-[#151515]"
                            >
                              <div className="px-4 py-4 flex flex-col gap-3">
                                <div className="grid grid-cols-12 gap-6">
                                  <div className="col-span-8 flex flex-col gap-1">
                                    <span className="text-kite-text-light text-[11px] uppercase tracking-wider font-medium">Business Owner Description</span>
                                    <span className="text-kite-text text-[13px] font-normal leading-relaxed">{business.description || "No description provided for this business owner."}</span>
                                  </div>
                                  <div className="col-span-4 flex flex-col gap-1 border-l border-kite-vertical-divider pl-6">
                                    <span className="text-kite-text-light text-[11px] uppercase tracking-wider font-medium">Business Owner Location</span>
                                    <span className="text-kite-text text-[13px] font-normal leading-relaxed">{business.location || "Not specified"}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
`;

content = content.replace(rowEndRegex, `$1${expandedSection}$2`);

fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched expand");
