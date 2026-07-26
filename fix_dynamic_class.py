import re
with open('src/pages/Businesses.tsx', 'r') as f:
    text = f.read()

text = text.replace(' focus:ring-0 focus:border-kite-blue"', '"')
with open('src/pages/Businesses.tsx', 'w') as f:
    f.write(text)
