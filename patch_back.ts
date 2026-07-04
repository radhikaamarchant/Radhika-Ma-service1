import fs from 'fs';
let code = fs.readFileSync('src/pages/Investors.tsx', 'utf8');

code = code.replace(
  `useMobileBackNavigation(viewMode === "withdraw-list", () => setViewMode("list"));`,
  `useMobileBackNavigation(viewMode === "withdraw-list", () => setViewMode("investor-detail"));`
);

code = code.replace(
  `<button
                      onClick={() => setViewMode("list")}
                      className="text-kite-text-light hover:text-kite-text transition-colors mr-3 p-1 -ml-1 rounded-full hover:bg-kite-bg"
                    >`,
  `<button
                      onClick={() => setViewMode("investor-detail")}
                      className="text-kite-text-light hover:text-kite-text transition-colors mr-3 p-1 -ml-1 rounded-full hover:bg-kite-bg"
                    >`
);

fs.writeFileSync('src/pages/Investors.tsx', code);
console.log("Success Patch Investors.tsx");
