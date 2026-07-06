import re

with open('src/components/InvestorDetail.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="w-12 h-12 md:w-14 md:h-14 rounded-full',
    'className="w-16 h-16 md:w-20 md:h-20 rounded-full'
)

with open('src/components/InvestorDetail.tsx', 'w') as f:
    f.write(content)

