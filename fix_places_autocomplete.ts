import * as fs from 'fs';

let content = fs.readFileSync('src/components/PlacesAutocomplete.tsx', 'utf8');

const targetProps = `  className
  placeholder?: string;
}: {`;

const replaceProps = `  className,
  placeholder
}: {`;

content = content.replace(targetProps, replaceProps);

fs.writeFileSync('src/components/PlacesAutocomplete.tsx', content, 'utf8');
console.log('PlacesAutocomplete syntax fixed!');
