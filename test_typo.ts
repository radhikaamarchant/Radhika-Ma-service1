import fs from 'fs';

// Helper to patch a specific pattern
function patchPattern(file: string, pattern: RegExp, appendClasses: string) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(pattern, (match, classAttr) => {
    // If it already has the appended classes, skip
    if (classAttr.includes(appendClasses)) return match;
    // Replace the class string
    const newClassAttr = classAttr + ' ' + appendClasses;
    return match.replace(classAttr, newClassAttr);
  });
  fs.writeFileSync(file, content);
}

// Let's do a test run first
console.log("Ready for test");
