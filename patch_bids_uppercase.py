import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# Update Business name uppercase
old_business_options = "options={state.businesses.map((b: any) => ({ value: b.shortName?.toUpperCase() || b.name.toUpperCase(), label: b.name }))}"
new_business_options = "options={state.businesses.map((b: any) => ({ value: b.shortName?.toUpperCase() || b.name.toUpperCase(), label: b.name.toUpperCase() }))}"
content = content.replace(old_business_options, new_business_options)

# Update Investor name uppercase
old_investor_options = "options={state.investors.map((inv: any) => ({ value: inv.id, label: `${inv.name} (${inv.investorId})` }))}"
new_investor_options = "options={state.investors.map((inv: any) => ({ value: inv.id, label: `${inv.name.toUpperCase()} (${inv.investorId})` }))}"
content = content.replace(old_investor_options, new_investor_options)

# Update apply conditions (Listed should allow applying)
old_apply_cond = "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && ("
new_apply_cond = "{(ipo.status === 'Open' || ipo.status === 'Upcoming' || ipo.status === 'Listed') && ("
content = content.replace(old_apply_cond, new_apply_cond)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
