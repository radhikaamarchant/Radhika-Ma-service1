import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# We need to find the `historyBidsApps.length > 0 && (` and wrap its contents in `<>`
bad_start = '''                      {historyBidsApps.length > 0 && (
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6">'''

good_start = '''                      {historyBidsApps.length > 0 && (
                        <>
                        <table className="w-full text-left text-[13px] md:text-[14px] mt-6">'''
content = content.replace(bad_start, good_start)

# We also need to fix the closing tags.
# Before:
#                         </table>
#                         )}
#                       )}
#                       </table>
#                     </div>

# Wait, `historyBidsApps` might be inside `Positions` desktop table!
# Let's inspect the file directly around line 1510.
