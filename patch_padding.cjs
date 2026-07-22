const fs = require('fs');
let code = fs.readFileSync('src/components/AddInvestmentModal.tsx', 'utf8');

const oldCode = `<div className="flex-1 overflow-y-auto">
                                  {sortedInvestors
                                    .filter((i) => {
                                      if (
                                        !i.name
                                          .toLowerCase()
                                          .includes(
                                            investorSearch.toLowerCase(),
                                          ) &&
                                        !i.investorId`;

const newCode = `<div className="flex-1 overflow-y-auto pb-3">
                                  {sortedInvestors
                                    .filter((i) => {
                                      if (
                                        !i.name
                                          .toLowerCase()
                                          .includes(
                                            investorSearch.toLowerCase(),
                                          ) &&
                                        !i.investorId`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/components/AddInvestmentModal.tsx', code);
