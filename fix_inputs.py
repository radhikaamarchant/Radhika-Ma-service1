import re

with open('src/pages/Businesses.tsx', 'r') as f:
    text = f.read()

# 1. Replace the wrapper divs to be relative
text = re.sub(r'<div>\s*<label className="block text-\[11px\] md:text-\[12px\] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">', 
    r'<div className="relative w-full mb-6">\n<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">', text)

text = re.sub(r'<div className="md:col-span-2">\s*<label className="block text-\[11px\] md:text-\[12px\] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">', 
    r'<div className="relative w-full mb-6 md:col-span-2">\n<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">', text)

# For "Owner Name" which has a different wrapper
# <div className="relative z-10"> \n <div className="flex justify-between items-center mb-1"> \n <label className="block text-[11px] md:text-[12px] font-medium text-kite-text dark:text-kite-text uppercase tracking-wider">
text = re.sub(r'<div className="relative z-10">\s*<div className="flex justify-between items-center mb-1">\s*<label className="block text-\[11px\] md:text-\[12px\] font-medium text-kite-text dark:text-kite-text uppercase tracking-wider">',
    r'<div className="relative w-full mb-6 z-10">\n<div className="flex justify-between items-center mb-1">\n<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">', text)

# For "Registration Fee (₹)"
# <div className="pt-2 mt-2">\s*<label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
text = re.sub(r'<div className="pt-2 mt-2">\s*<label className="block text-\[11px\] md:text-\[12px\] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">',
    r'<div className="relative w-full mb-6 pt-2 mt-2">\n<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">', text)

# Now, replace the inputs and selects classes
old_input_class_1 = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"'
new_input_class_1 = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors uppercase"'
text = re.sub(old_input_class_1, new_input_class_1, text)

old_input_class_2 = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"'
new_input_class_2 = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors"'
text = re.sub(old_input_class_2, new_input_class_2, text)

# For Authority Type select:
old_select_class = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors outline-none cursor-pointer"'
new_select_class = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors cursor-pointer"'
text = re.sub(old_select_class, new_select_class, text)

# For Account Number, IFSC Code, Account Holder Name, Bank Name
# The classes are dynamic strings like: className={`... ${ownerMode === "existing" ? ... : ...}`}
# Let's replace the base string in them
old_dynamic_base = r'w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-mono outline-none transition-colors'
new_dynamic_base = r'w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm font-mono focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors'
text = re.sub(old_dynamic_base, new_dynamic_base, text)

old_dynamic_base2 = r'w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-mono uppercase outline-none transition-colors'
new_dynamic_base2 = r'w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm font-mono uppercase focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors'
text = re.sub(old_dynamic_base2, new_dynamic_base2, text)

old_dynamic_base3 = r'w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal uppercase outline-none transition-colors'
new_dynamic_base3 = r'w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm font-normal uppercase focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors'
text = re.sub(old_dynamic_base3, new_dynamic_base3, text)

# Bank Select Div
old_bank_div = r'className={`w-full border-0 border-b border-kite-border py-2 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-kite-blue \$\{ownerMode === "existing" \? "opacity-50 pointer-events-none" : ""\}`}'
new_bank_div = r'className={`w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-[#387ed1] focus:outline-none ${ownerMode === "existing" ? "opacity-50 pointer-events-none" : ""}`}'
text = re.sub(old_bank_div, new_bank_div, text)

# Existing Owner Select Div
# <div className="relative z-20"> \n <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">
text = re.sub(r'<div className="relative z-20">\s*<label className="block text-\[11px\] md:text-\[12px\] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">',
    r'<div className="relative w-full mb-6 z-20">\n<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">', text)

old_owner_div = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border py-2 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-kite-blue"'
new_owner_div = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent cursor-pointer flex justify-between items-center transition-colors hover:border-[#387ed1] focus:outline-none"'
text = re.sub(old_owner_div, new_owner_div, text)

# OWNER ID NUMBER
old_id_input = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-mono text-kite-text-light dark:text-kite-text-light cursor-not-allowed outline-none"'
new_id_input = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm font-mono text-kite-text-light dark:text-kite-text-light cursor-not-allowed outline-none focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors"'
text = re.sub(old_id_input, new_id_input, text)

# Registration Fee
old_fee_input = r'className="w-full md:w-1/2 border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-blue focus:ring-0 focus:border-kite-blue outline-none transition-colors"'
new_fee_input = r'className="w-full md:w-1/2 border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm font-normal text-kite-blue focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors"'
text = re.sub(old_fee_input, new_fee_input, text)

with open('src/pages/Businesses.tsx', 'w') as f:
    f.write(text)

print("Replaced!")
