const fs = require('fs');
let code = fs.readFileSync('src/pages/DataAnalysis.tsx', 'utf8');

const targetStr = `{cities.map((city: string) => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setExpandedBusinessId(null); }}
                  className={\`px-4 py-3 text-[13px] md:text-[14px] font-medium transition-colors relative capitalize \${
                    selectedCity === city
                      ? "text-kite-blue"
                      : "text-kite-text-light hover:text-kite-text"
                  }\`}
                >
                  {city}
                  {selectedCity === city && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue" />
                  )}
                </button>
              ))}`;

const replacementStr = `{cities.map((city: string) => {
                const investorCountForCity = state.investors.filter((i: any) => i.address?.city?.toLowerCase()?.trim() === city).length;
                return (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setExpandedBusinessId(null); }}
                  className={\`px-4 py-3 text-[13px] md:text-[14px] font-medium transition-colors relative capitalize \${
                    selectedCity === city
                      ? "text-kite-blue"
                      : "text-kite-text-light hover:text-kite-text"
                  }\`}
                >
                  {city}-{investorCountForCity}
                  {selectedCity === city && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-kite-blue" />
                  )}
                </button>
              ) })}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('src/pages/DataAnalysis.tsx', code);
    console.log("Patched cities.map");
} else {
    console.log("Could not find targetStr");
}
