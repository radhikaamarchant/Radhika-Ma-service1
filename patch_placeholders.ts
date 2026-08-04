import * as fs from 'fs';

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const residentTarget = `              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Resident / House Name
              </label>
              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: value } })
                }
              />`;

const residentReplace = `              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Resident / House Name
              </label>
              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.residentHouseName}
                placeholder="Search resident or house name..."
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, residentHouseName: value } })
                }
              />`;

content = content.replace(residentTarget, residentReplace);

const landmarkTarget = `              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Circle & Landmark
              </label>
              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: value } })
                }
              />`;

const landmarkReplace = `              <label className="block text-[10px] md:text-[11px] font-medium mb-1 text-kite-text-light uppercase tracking-wider">
                Circle & Landmark
              </label>
              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                placeholder="Search circle or landmark..."
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: value } })
                }
              />`;

content = content.replace(landmarkTarget, landmarkReplace);

fs.writeFileSync('src/components/InvestorDetail.tsx', content, 'utf8');
console.log('Placeholders patched!');
