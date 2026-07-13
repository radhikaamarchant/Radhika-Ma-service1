const fs = require('fs');

let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

content = content.replace('{viewMode === "list" && (\n          <>\n            <div className="md:sticky', '{viewMode === "list" && (\n          <div className="w-full">\n            <div className="md:sticky');

content = content.replace('      {/* Expanded Section (Desktop Only) */}', '      {/* Expanded Section (Desktop Only) */}');

// The closing tag for viewMode === "list"
content = content.replace('                  </AnimatePresence>\n                </div>\n              </div>\n            </div>\n          </>', '                  </AnimatePresence>\n                </div>\n              </div>\n            </div>\n          </div>');

fs.writeFileSync('src/pages/Businesses.tsx', content);
