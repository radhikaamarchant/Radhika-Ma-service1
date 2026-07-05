import fs from 'fs';

const cssToAdd = `

/* --- USER REQUESTED SPACING & HEIGHT SYSTEM FOR DESKTOP --- */
@media (min-width: 768px) {
  /* Heights */
  
  /* Table Row: 60px */
  tbody tr, 
  .group.cursor-pointer.min-h-\\[50px\\] {
    height: 60px !important;
    min-height: 60px !important;
  }
  
  /* Search Box: 40px */
  input[type="text"][placeholder*="Search"],
  input[type="text"][placeholder*="search"],
  .h-\\[36px\\] {
    height: 40px !important;
    min-height: 40px !important;
  }
  
  /* Button: 38px */
  button:not(.rounded-full):not(.p-1):not(.p-2):not(.absolute) {
    height: 38px !important;
    min-height: 38px !important;
  }
  
  /* Navbar: 56px */
  header.h-\\[55px\\], 
  header.z-\\[110\\] {
    height: 56px !important;
    min-height: 56px !important;
  }

  /* Border Radius */
  
  /* Card, Search, Button, Input: 4px */
  .rounded,
  .rounded-sm,
  .rounded-md,
  .rounded-lg,
  .dark .bg-kite-surface,
  input,
  button:not(.rounded-full) {
    border-radius: 4px !important;
  }

  /* All Text letter spacing: 0px */
  * {
    letter-spacing: 0px !important;
  }
}
`;

let content = fs.readFileSync('src/index.css', 'utf8');
if (!content.includes('/* --- USER REQUESTED SPACING & HEIGHT SYSTEM FOR DESKTOP --- */')) {
  fs.writeFileSync('src/index.css', content + cssToAdd);
  console.log("Added desktop spacing CSS");
} else {
  console.log("Already present.");
}
