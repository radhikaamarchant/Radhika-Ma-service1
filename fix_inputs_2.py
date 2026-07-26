import re

with open('src/pages/Businesses.tsx', 'r') as f:
    text = f.read()

# Replace all labels
old_label = r'<label className="block text-\[11px\] md:text-\[12px\] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider">'
new_label = r'<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">'
text = re.sub(old_label, new_label, text)

old_label_2 = r'<label className="block text-\[11px\] md:text-\[12px\] font-medium text-kite-text dark:text-kite-text uppercase tracking-wider">'
new_label_2 = r'<label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10">'
text = re.sub(old_label_2, new_label_2, text)

# Now we need to add relative wrapper classes.
# We can find the surrounding div. But since there are a few of them, let's just do it manually.
# Every input is inside a <div> that has no classes or some simple classes.
# The simplest approach: we can just add `relative w-full mb-6` to the input's parent div.
# Instead of regex for the div, I can do a pass to find `<div` right before the newly replaced label, but there might be `{" "}` between them.

text = re.sub(r'<div>(\s*\{" "\}\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6">\1<label className="absolute -top-2.5', text)
text = re.sub(r'<div className="relative z-10">(\s*\{" "\}\s*)<div className="flex justify-between items-center mb-1">(\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6 z-10">\1<div className="flex justify-between items-center mb-1">\2<label className="absolute -top-2.5', text)
text = re.sub(r'<div className="relative z-20">(\s*\{" "\}\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6 z-20">\1<label className="absolute -top-2.5', text)
text = re.sub(r'<div className="pt-2 mt-2">(\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6 pt-2 mt-2">\1<label className="absolute -top-2.5', text)
text = re.sub(r'<div className="md:col-span-2">(\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6 md:col-span-2">\1<label className="absolute -top-2.5', text)
text = re.sub(r'<div>(\s*)<label className="absolute -top-2.5', r'<div className="relative w-full mb-6">\1<label className="absolute -top-2.5', text)
text = re.sub(r'<div className="relative z-20">(\s*)<div\s+className={`w-full border border-gray-300', r'<div className="relative w-full mb-6 z-20">\1<div className={`w-full border border-gray-300', text)

# For input classes that weren't replaced yet (if any)
old_input_class_3 = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none uppercase"'
new_input_class_3 = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors uppercase"'
text = re.sub(old_input_class_3, new_input_class_3, text)

# One more pass for inputs that might not have "uppercase"
old_input_class_4 = r'className="w-full border-0 border-b border-kite-border dark:border-kite-border rounded-none px-0 py-2 bg-transparent text-\[13px\] md:text-\[14px\] font-normal text-kite-text dark:text-kite-text focus:ring-0 focus:border-kite-blue transition-colors placeholder-gray-400 dark:placeholder-kite-text-light outline-none"'
new_input_class_4 = r'className="w-full border border-gray-300 dark:border-gray-600 rounded-none px-4 py-3 bg-transparent text-sm focus:outline-none focus:border-[#387ed1] focus:ring-1 focus:ring-[#387ed1] transition-colors"'
text = re.sub(old_input_class_4, new_input_class_4, text)

# Also fix the `Select Bank` dropdown 
# Wait, let's see if Bank select div was replaced.
# It had className={`w-full border-0...
# Let's write back
with open('src/pages/Businesses.tsx', 'w') as f:
    f.write(text)

