import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('function AdminBidsView({ ipos, saveIpos, commissions, applications, onClose }: any) {')
end_idx = content.find('function DetailsModal({', start_idx)
admin_func = content[start_idx:end_idx]

matches = re.findall(r'<div>\s*<label[^>]*>Company Name</label>\s*<input type="text"[^>]*companyName[^>]*>\s*</div>', admin_func)
print(len(matches), "matches found.")
if len(matches) == 0:
    print(admin_func[admin_func.find('Company Name')-50 : admin_func.find('Company Name')+300])

