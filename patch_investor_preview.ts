import * as fs from 'fs';

let content = fs.readFileSync('src/components/InvestorPreviewModal.tsx', 'utf8');

const target = `{investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
            <div className="mb-6">
              <div className="text-[13px] md:text-[14px] text-kite-text space-y-1">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            </div>
          )}`;

const replacement = `{investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
            <div className="mb-6">
              <a 
                href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent([
                  investor.address.flatHouse,
                  investor.address.residentHouseName,
                  investor.address.landmark,
                  investor.address.city,
                  investor.address.state,
                  "India"
                ].filter(Boolean).join(", "))}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[13px] md:text-[14px] text-kite-text hover:text-kite-blue transition-colors space-y-1 group"
              >
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[11px] text-kite-blue opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <span>Open in Google Maps</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </div>
              </a>
            </div>
          )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/InvestorPreviewModal.tsx', content, 'utf8');
console.log('Investor preview patched!');
