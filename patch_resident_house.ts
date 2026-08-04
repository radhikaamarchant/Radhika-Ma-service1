import * as fs from 'fs';

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const inputTarget = `              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: e.target.value } })
                }
              />`;

const inputReplacement = `              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: value } })
                }
              />`;

content = content.replace(inputTarget, inputReplacement);

fs.writeFileSync('src/components/InvestorDetail.tsx', content, 'utf8');
console.log('Resident/House field replaced!');
