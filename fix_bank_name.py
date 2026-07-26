import re
with open('src/pages/Businesses.tsx', 'r') as f:
    text = f.read()

text = text.replace(
'''                <div className="md:col-span-2">
                  <label className="block text-[11px] md:text-[12px] font-medium mb-1 text-kite-text dark:text-kite-text uppercase tracking-wider flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank Name</span>
                  </label>
                  <div className="relative w-full mb-6 z-20">''',
'''                <div className="md:col-span-2 relative w-full mb-6 z-20">
                  <label className="absolute -top-2.5 left-3 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-white dark:bg-kite-bg md:dark:bg-[#181818] z-10 flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank Name</span>
                  </label>
                  <div>'''
)
with open('src/pages/Businesses.tsx', 'w') as f:
    f.write(text)
