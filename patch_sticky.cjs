const fs = require('fs');
let content = fs.readFileSync('src/pages/Businesses.tsx', 'utf8');

const str1 = '<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">';
const rep1 = '<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">';

const str2 = '<div className="overflow-hidden">';
// wait, we only want to replace the one right below it
// let's do a more precise replacement.

const strToReplace = `<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none overflow-hidden z-10 md:mt-0">
              <div className="overflow-hidden">`;
const newStr = `<div className="w-full bg-transparent border-t border-kite-border md:border-t-0 md:border-transparent rounded-none md:overflow-visible overflow-hidden z-10 md:mt-0">
              <div className="md:overflow-visible overflow-hidden">`;

if (content.includes(strToReplace)) {
    content = content.replace(strToReplace, newStr);
    console.log("Patched ancestors");
} else {
    console.log("Could not find ancestors");
}

fs.writeFileSync('src/pages/Businesses.tsx', content);
