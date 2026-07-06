const fs = require('fs');

function revert(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    '<div className={`p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg ${withdrawStep === 0 ? "hidden md:block" : ""}`}>',
    '<div className="p-4 md:p-6 flex-1 overflow-y-auto bg-kite-bg">'
  );
  fs.writeFileSync(file, content);
  console.log("Reverted", file);
}

revert('src/components/LivePortfolioDetail.tsx');
revert('src/pages/Investments.tsx');
