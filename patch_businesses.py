import re

with open("src/pages/Businesses.tsx", "r") as f:
    content = f.read()

# Make Header Section sticky
header_match = r'(<div className="px-3 md:px-4 pt-2 md:pt-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-3 md:mb-4 z-10">)'
header_replacement = '<div className="px-3 md:px-4 pt-2 md:pt-4 pb-2 md:pb-4 flex flex-col md:flex-row md:justify-between md:items-center relative mb-1 md:mb-0 z-30 md:sticky md:top-0 bg-white dark:bg-kite-bg">'

if re.search(header_match, content):
    content = re.sub(header_match, header_replacement, content)
    print("Patched Header Section")
else:
    print("Could not find Header Section")

# Make DESKTOP HEADER sticky
desktop_header_match = r'(<div className="hidden md:flex items-center px-4 bg-\[#F9F9F9\] dark:bg-\[#1a1a1a\] border-b border-kite-border">)'
desktop_header_replacement = '<div className="hidden md:flex items-center px-4 bg-[#F9F9F9] dark:bg-[#1a1a1a] border-b border-kite-border md:sticky md:top-[68px] z-20">'

if re.search(desktop_header_match, content):
    content = re.sub(desktop_header_match, desktop_header_replacement, content)
    print("Patched DESKTOP HEADER")
else:
    print("Could not find DESKTOP HEADER")

with open("src/pages/Businesses.tsx", "w") as f:
    f.write(content)

