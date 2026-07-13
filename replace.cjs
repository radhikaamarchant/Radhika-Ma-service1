const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');
let exact = fs.readFileSync('exact.txt', 'utf8');

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
                <div className="w-[28%] text-left py-2 text-[12px] text-kite-text-muted border-l border-kite-vertical-divider pl-4">OWNER NAME</div>`;

content = content.replace(exact.trim(), replacement.trim());
fs.writeFileSync('src/pages/Businesses.tsx', content);
