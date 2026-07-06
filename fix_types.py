import re

with open('src/types.ts', 'r') as f:
    content = f.read()

# Fix Business photoUrl duplication
content = content.replace("  shortName?: string;\n  photoUrl?: string;\n  ownerName: string;\n  description?: string;\n  location?: string;\n  photoUrl?: string;", "  shortName?: string;\n  ownerName: string;\n  description?: string;\n  location?: string;\n  photoUrl?: string;")

with open('src/types.ts', 'w') as f:
    f.write(content)

