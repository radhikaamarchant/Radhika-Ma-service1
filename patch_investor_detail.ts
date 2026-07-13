import fs from 'fs';

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

// 1. Add INDIAN_CITIES import if not there
if (!content.includes('INDIAN_CITIES')) {
    content = content.replace(
        'import { calculateLiveProfit } from "../utils/profitCalculator";',
        'import { calculateLiveProfit } from "../utils/profitCalculator";\nimport { INDIAN_CITIES } from "../utils/indianCities";'
    );
}

// 2. Replace formData state
content = content.replace(
    /const \[formData, setFormData\] = useState\(\{[\s\S]*?photoUrl: investor\?.photoUrl \|\| "",\n  \}\);/,
    `const [formData, setFormData] = useState({
    name: investor?.name || "",
    bio: investor?.bio || "",
    address: {
      flatHouse: investor?.address?.flatHouse || "",
      residentHouseName: investor?.address?.residentHouseName || "",
      landmark: investor?.address?.landmark || "",
      city: investor?.address?.city || "",
      state: investor?.address?.state || "",
    },
    bankName: investor?.bankDetails?.bankName || "",
    accountNumber: investor?.bankDetails?.accountNumber || "",
    ifscCode: investor?.bankDetails?.ifscCode || "",
    accountHolderName: investor?.bankDetails?.accountHolderName || "",
    photoUrl: investor?.photoUrl || "",
  });

  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);`
);

// 3. Replace handleSaveDetails
content = content.replace(
    /const handleSaveDetails = \(\) => \{[\s\S]*?setIsEditingDetails\(false\);\n  \};/,
    `const handleSaveDetails = () => {
    dispatch({
      type: "UPDATE_INVESTOR",
      payload: {
        ...investor,
        name: formData.name,
        bio: formData.bio,
        address: formData.address,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
        },
        photoUrl: formData.photoUrl,
      },
    });
    setIsEditingDetails(false);
  };`
);

// 4. Replace bio and address rendering on the left side
const leftSideOriginal = `              #{investor.investorId}
            </span>
          </div>
        </div>
      </div>`;

const leftSideReplacement = `              #{investor.investorId}
            </span>
            {investor.bio && (
              <p className="mt-3 text-[12px] md:text-[13px] text-kite-text whitespace-pre-wrap leading-relaxed">
                {investor.bio}
              </p>
            )}
            {investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
              <div className="mt-3 text-[11px] md:text-[12px] text-kite-text-light flex flex-col space-y-0.5">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>`;
content = content.replace(leftSideOriginal, leftSideReplacement);

// 5. Replace Edit Details Form (mobile, email, address -> bio, flatHouse, residentHouseName, landmark, city dropdown)
const formOriginal = `            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Address
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>`;

const formReplacement = `            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Bio
              </label>
              <textarea
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none min-h-[100px] resize-y whitespace-pre-wrap"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Enter investor bio..."
              />
            </div>
            <div className="md:col-span-2 pt-4 pb-2">
              <h4 className="text-[11px] md:text-[12px] font-medium text-kite-text uppercase tracking-wider border-b border-kite-border pb-2">
                Address Details
              </h4>
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Flat / House No.
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.flatHouse}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, flatHouse: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Resident / House Name
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: e.target.value } })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Circle & Landmark
              </label>
              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: e.target.value } })
                }
              />
            </div>
            <div className="relative">
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-kite-border rounded-sm px-3 py-2 pr-8 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                  value={showCityDropdown ? citySearch : formData.address.city}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (!showCityDropdown) setShowCityDropdown(true);
                  }}
                  onFocus={() => {
                    setCitySearch("");
                    setShowCityDropdown(true);
                  }}
                  onBlur={() => {
                    // Small delay to allow clicking on dropdown
                    setTimeout(() => setShowCityDropdown(false), 200);
                  }}
                  placeholder="Search city..."
                />
                <Search className="absolute right-2 top-2.5 w-4 h-4 text-kite-text-light pointer-events-none" />
              </div>
              
              {showCityDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-kite-surface border border-kite-border rounded-sm shadow-lg max-h-60 overflow-y-auto">
                  {INDIAN_CITIES.filter((c) =>
                    c.city.toLowerCase().includes(citySearch.toLowerCase())
                  ).slice(0, 50).map((c, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 hover:bg-kite-bg cursor-pointer text-[13px] md:text-[14px] border-b border-kite-border last:border-0"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: c.city, state: c.state }
                        });
                        setCitySearch("");
                        setShowCityDropdown(false);
                      }}
                    >
                      <span className="font-medium">{c.city}</span>
                      <span className="text-kite-text-light text-[11px] md:text-[12px] ml-2 block sm:inline">{c.state}</span>
                    </div>
                  ))}
                  {INDIAN_CITIES.filter((c) =>
                    c.city.toLowerCase().includes(citySearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-[13px] md:text-[14px] text-kite-text-light">
                      No city found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                State
              </label>
              <input
                type="text"
                disabled
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-kite-bg text-[13px] md:text-[14px] font-medium text-kite-text outline-none cursor-not-allowed opacity-70"
                value={formData.address.state}
              />
            </div>`;

content = content.replace(formOriginal, formReplacement);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
