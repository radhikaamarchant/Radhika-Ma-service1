const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const target = `<div className="px-3 md:px-0 flex flex-col md:flex-row md:justify-between md:items-end relative mb-3 md:mb-0">
              {" "}
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                {" "}
                <div className="hidden md:block">
                  {" "}
                  <h2 className="text-[15px] md:text-[16px] font-normal text-kite-text tracking-tight uppercase">
                    My Investors
                  </h2>{" "}
                </div>{" "}
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">`;

const replacement = `<div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4">
              {" "}
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                {" "}
                <div className="hidden md:block">
                  {" "}
                  <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                    My Investors
                  </h2>{" "}
                </div>{" "}
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log('Fixed Investors.tsx');
} else {
  console.log('Could not find target in Investors.tsx');
}
