import * as fs from 'fs';

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const importTarget = `import ImageCropModal from "./ImageCropModal";`;
const importReplacement = `import ImageCropModal from "./ImageCropModal";
import PlacesAutocomplete from "./PlacesAutocomplete";`;

content = content.replace(importTarget, importReplacement);

const inputTarget = `              <input
                type="text"
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                onChange={(e) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: e.target.value } })
                }
              />`;

const inputReplacement = `              <PlacesAutocomplete
                className="w-full border border-kite-border rounded-sm px-3 py-2 bg-transparent text-[13px] md:text-[14px] font-medium text-kite-text focus:ring-1 focus:ring-kite-blue focus:border-kite-blue transition-colors outline-none"
                value={formData.address.landmark}
                onChange={(value) =>
                  setFormData({ ...formData, address: { ...formData.address, landmark: value } })
                }
              />`;

content = content.replace(inputTarget, inputReplacement);

fs.writeFileSync('src/components/InvestorDetail.tsx', content, 'utf8');
console.log('InvestorDetail.tsx patched for Places Autocomplete');
