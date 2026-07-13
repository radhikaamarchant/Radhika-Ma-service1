const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const startIndex = content.indexOf('                          </div></div>{" "}</div></div>{" "}{/* DESKTOP HEADER (Moved to be sticky together) */}');
const endIndex = content.indexOf('FUND</div>') + 'FUND</div>\n                  </div>'.length;

if (startIndex !== -1 && endIndex !== -1) {
    const toReplace = content.substring(startIndex, endIndex);
    const replacement = `                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DESKTOP HEADER (Moved to be sticky together) */}
              <div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border w-full">
                <div className="w-[30%] text-left py-2 text-[12px] text-kite-text-muted">BUSSINESS NAME</div>
                <div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>
                <div className="w-[14%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">ID</div>
                <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pr-4">ROI</div>
                <div className="w-[14%] text-right py-2 text-[12px] text-kite-text-muted pl-5 border-l border-kite-vertical-divider">FUND</div>
              </div>
            </div>

            <div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">
              <div className="md:overflow-visible overflow-hidden">
                {" "}
                {/* Unified Watchlist View */}{" "}
                <div className="flex flex-col border-b border-kite-border pb-20 md:pb-0">`;
                
    content = content.replace(toReplace, replacement);
    fs.writeFileSync('src/pages/Businesses.tsx', content);
    console.log("Success by index!");
} else {
    console.log("Index not found.");
}
