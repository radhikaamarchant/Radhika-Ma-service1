const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const oldTarget = `                  />
                  {ownerMode === "existing" ? (
                    <p className="text-[11px] md:text-[12px] text-orange-600 mt-1.5 font-normal">
                      Bank details are locked because this owner is already
                      registered.
                    </p>
                  ) : (
                    <p className="text-[11px] md:text-[12px] text-kite-text-light dark:text-kite-text-light mt-1.5">
                      Auto-filled from Step 1. You can edit if bank account name
                      differs.
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-kite-border dark:border-kite-border pt-6 mt-2">`;

const newTarget = `                  />
                  {ownerMode === "existing" && (
                    <p className="text-[11px] md:text-[12px] text-orange-600 mt-1.5 font-normal">
                      Bank details are locked because this owner is already
                      registered.
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-kite-border dark:border-kite-border pt-6 mt-2">`;

content = content.replace(oldTarget, newTarget);
fs.writeFileSync('src/pages/Businesses.tsx', content);
console.log("Patched auto-fill text");
