import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''         if (modifiedApps) {
            // Assuming AdminBidsView has saveApplications prop? No, it doesn't! We need to pass saveApplications to it.
         }''',
'''         if (modifiedApps) {
            saveApplications(updatedApps);
         }'''
)

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
