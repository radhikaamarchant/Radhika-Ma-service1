import * as fs from 'fs';

let content = fs.readFileSync('src/components/PlacesAutocomplete.tsx', 'utf8');

const targetProps = `}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {`;

const replaceProps = `  placeholder?: string;
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {`;

content = content.replace(targetProps, replaceProps);

const targetInput = `      onChange={(e) => onChange(e.target.value)}
      placeholder="Search for circle or landmark..."
    />`;

const replaceInput = `      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search location..."}
    />`;

content = content.replace(targetInput, replaceInput);

fs.writeFileSync('src/components/PlacesAutocomplete.tsx', content, 'utf8');
console.log('PlacesAutocomplete patched!');
