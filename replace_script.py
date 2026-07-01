import sys

with open("src/pages/Investments.tsx", "r") as f:
    content = f.read()

start_str = "        {showAddForm && ("
end_str = "        className={`w-full bg-transparent border-t"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

# Find the </AnimatePresence> just before end_idx
end_idx = content.rfind("      </AnimatePresence>", 0, end_idx) + len("      </AnimatePresence>\n")

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    sys.exit(1)

with open("replacement.tsx", "r") as f:
    replacement = f.read()

new_content = content[:start_idx] + replacement + content[end_idx:]

with open("src/pages/Investments.tsx", "w") as f:
    f.write(new_content)

print("Replaced successfully")
