const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

const errPart = `                      </div>
                    </div>
                        {/* Desktop View */}`;

const fixedPart = `                      </div>
                        {/* Desktop View */}`;

content = content.replace(errPart, fixedPart);

fs.writeFileSync('src/pages/Investors.tsx', content);
console.log("Fixed");
