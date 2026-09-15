import os
import re

directory = 'src'
hex_to_replace = ['#222222', '#2A2A2A', '#1E1E1E', '#222', '#2a2a2a', '#1e1e1e']

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            for h in hex_to_replace:
                # Replace exact match in bg-[...]
                new_content = re.sub(r'bg-\[' + h + r'\]', 'bg-[#000000]', new_content)
                new_content = re.sub(r'bg-\[' + h.lower() + r'\]', 'bg-[#000000]', new_content)
                new_content = re.sub(r'bg-\[' + h.upper() + r'\]', 'bg-[#000000]', new_content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
