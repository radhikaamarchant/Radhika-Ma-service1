const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf-8');

const target = `            {/* Header Section */}{" "}
            <div className="px-3 md:px-0 flex flex-col items-start mb-3 relative z-10">
              {" "}
              <div className="flex flex-col items-start w-full gap-2">
                {" "}
                <button`;

const replacement = `            {/* Header Section */}{" "}
            <div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4 z-10">
              {" "}
              <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between transition-all duration-300 gap-3 md:gap-0">
                {" "}
                <div className="hidden md:block">
                  {" "}
                  <h2 className="text-[13px] md:text-[14px] font-medium text-kite-text tracking-wider uppercase">
                    My Businesses
                  </h2>{" "}
                </div>{" "}
                <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto md:justify-end gap-2 md:gap-4">
                  {" "}
                  <div className="w-full md:w-auto pt-1 md:pt-0 pb-2 md:pb-0">
                    {" "}
                    <button`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/Businesses.tsx', content);
  console.log('Fixed Businesses.tsx part 1');
} else {
  console.log('Could not find target in Businesses.tsx part 1');
}
