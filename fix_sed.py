import re
with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && !hasApplied &&&& !hasApplied && (",
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && ("
)
content = content.replace(
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && !hasApplied && (",
    "{(ipo.status === 'Open' || ipo.status === 'Upcoming') && ("
)
with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
