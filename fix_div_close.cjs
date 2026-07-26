const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

content = content.replace(
/                              <\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
`                              </span>
                            </div>
                          </div>
                          </div>
                        </div>
                      )}`
);
fs.writeFileSync('src/pages/Investors.tsx', content);
