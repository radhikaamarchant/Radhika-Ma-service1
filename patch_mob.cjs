const fs = require('fs');
let code = fs.readFileSync('src/pages/Investments.tsx', 'utf-8');

const targetStr = `                        <AnimatePresence>
                          {showInvestorSelect && (
                            <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: "auto", opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               transition={{ duration: 0.2, ease: "easeInOut" }}
                               className="overflow-hidden bg-gray-50 dark:bg-[#2B3648] border-t border-gray-200 dark:border-[#44546A]"
                            >`;

const replacementStr = `                        {showInvestorSelect && (
                            <div
                               className="absolute top-full left-0 right-0 z-[100] overflow-hidden bg-gray-50 dark:bg-[#2B3648] border-b border-x border-gray-200 dark:border-[#44546A] shadow-xl origin-top"
                               style={{ animation: '0.1s ease-out forwards slideDown' }}
                            >`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  code = code.replace(`                            </motion.div>\n                          )}\n                        </AnimatePresence>`, `                            </div>\n                          )}`);
  fs.writeFileSync('src/pages/Investments.tsx', code);
  console.log('Mobile Investor Select successfully updated to absolute & fast!');
} else {
  console.log('Could not find target string');
}
