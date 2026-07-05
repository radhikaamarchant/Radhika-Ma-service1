import re

with open('src/pages/Investors.tsx', 'r') as f:
    content = f.read()

# We need to insert `</table>` after `</tbody>` before `{historyBidsApps.length > 0 && (`
# Let's find exactly `</tbody>\n                      {historyBidsApps.length > 0 && (`
match = re.search(r'</tbody>\s*\{historyBidsApps.length > 0 && \(', content)
if match:
    content = content[:match.start()] + '</tbody>\n                      </table>\n                      {historyBidsApps.length > 0 && (' + content[match.end():]

# Now let's fix the end of it
# `Expected ")" but found "{"` on line 1485
# {activeBidsApps.length > 0 && (
# It is because `{historyBidsApps.length > 0 && (` is missing a closing `)}` before `{activeBidsApps` starts!
# Wait! `{historyBidsApps.length > 0 && ( ... </table> {activeBidsApps`
# If we have `{cond && ( <table /> {cond2 && <table />} )}`, that's INVALID JSX! 
# You can't return `<table /> {cond2 ... }` without `<>` inside `&& (`.
# BUT I don't want `activeBidsApps` to be INSIDE `historyBidsApps`!
# They should be SIBLINGS!
# So it should be:
# {historyBidsApps.length > 0 && ( <table /> )}
# {activeBidsApps.length > 0 && ( <table /> )}

match2 = re.search(r'</table>\s*\{activeBidsApps.length > 0 && \(', content)
if match2:
    content = content[:match2.start()] + '</table>\n                        )}\n                        {activeBidsApps.length > 0 && (' + content[match2.end():]


with open('src/pages/Investors.tsx', 'w') as f:
    f.write(content)
