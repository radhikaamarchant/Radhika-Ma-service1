const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const oldListStart = `        )}{" "}
        {viewMode === "list" && (
          <div className="w-full">`;

const newListStart = `        )}{" "}
        <div className={viewMode === "list" ? "w-full block" : "w-full hidden"}>
          <div className="w-full">`;

const oldListEnd = `                {/* Mobile Cards View */} <div className="hidden"> </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {viewMode === "add-step-1" && (`

const newListEnd = `                {/* Mobile Cards View */} <div className="hidden"> </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        </div>{" "}
        {viewMode === "add-step-1" && (`

if (content.includes(oldListStart) && content.includes(oldListEnd)) {
  content = content.replace(oldListStart, newListStart);
  content = content.replace(oldListEnd, newListEnd);
  fs.writeFileSync('src/pages/Investors.tsx', content);
  console.log("List view conditional replacement successful.");
} else {
  console.log("Could not find the exact strings for list view replacement.");
  if (!content.includes(oldListStart)) console.log("Missing oldListStart");
  if (!content.includes(oldListEnd)) console.log("Missing oldListEnd");
}
