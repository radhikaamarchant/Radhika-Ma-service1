import os
import re

directory = 'src'
hex_to_replace = ['#181818', '#14212B', '#1c2a37', '#1C2A37', '#131415']

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
