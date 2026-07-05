import fs from 'fs';

const cssToAdd = `

/* --- USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- */
@media (min-width: 768px) {
  /* Dashboard Heading (32px, 400, #E3E3E3, 40px) */
  .dark h1.uppercase, 
  .dark h2.uppercase.tracking-tight {
    font-size: 32px !important;
    font-weight: 400 !important;
    color: #E3E3E3 !important;
    line-height: 40px !important;
  }

  /* Section Heading (Holdings, Positions) (16px, 500, #E3E3E3, 24px) */
  .dark h2:not(.uppercase),
  .dark h1.tracking-widest,
  .dark h2.tracking-widest,
  .dark h2.tracking-wider,
  .dark h1.uppercase.tracking-tighter,
  .dark .text-\\[15px\\].font-medium.tracking-tight,
  .dark .text-\\[15px\\].md\\:text-\\[16px\\].font-medium {
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #E3E3E3 !important;
    line-height: 24px !important;
  }

  /* Card Title (13px, 400, #BDBDBD, 20px) */
  .dark p.text-kite-text-light.uppercase,
  .dark p.text-kite-text-light.mb-1,
  .dark p.text-kite-text-light.mb-2,
  .dark p.text-gray-500.uppercase {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: #BDBDBD !important;
    line-height: 20px !important;
  }

  /* Big Amount (18px, 400, #E3E3E3, 28px) */
  .dark p.font-medium.text-kite-text,
  .dark p.text-kite-text[style*="font-family"],
  .dark p.text-\\[20px\\],
  .dark p.md\\:text-\\[22px\\],
  .dark p.text-\\[18px\\],
  .dark p.md\\:text-\\[18px\\] {
    font-size: 18px !important;
    font-weight: 400 !important;
    color: #E3E3E3 !important;
    line-height: 28px !important;
  }

  /* Table Header (13px, 400, #BDBDBD, 20px) */
  .dark th,
  .dark .hidden.md\\:flex.text-\\[11px\\].text-kite-text-light.bg-kite-surface div {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: #BDBDBD !important;
    line-height: 20px !important;
  }

  /* Primary Row Title (Business Name / Company Name / Investor Name) (15px, 400, #E3E3E3, 22px) */
  /* For Businesses list */
  .dark .flex-1 .flex.items-center span.uppercase.text-kite-text,
  /* For Investments list */
  .dark .w-3\\/12 .flex.items-center.text-kite-text.uppercase,
  .dark td:first-child .font-medium,
  .dark td:first-child p.font-medium,
  .dark td:first-child span.font-medium {
    font-size: 15px !important;
    font-weight: 400 !important;
    color: #E3E3E3 !important;
    line-height: 22px !important;
  }

  /* Secondary Row Text (Owner Name / Investor Name Subtitle / ID / Mobile) (13px, 400, #8A8A8A, 18px) */
  /* For Businesses list (ownerName) */
  .dark .flex-1 > span.text-kite-text-light,
  /* For Investments list (investor name under business) */
  .dark .w-3\\/12 > span.text-kite-text-light,
  /* General subtitle in tables */
  .dark td:first-child .text-kite-text-light,
  .dark td:first-child p.text-kite-text-light {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: #8A8A8A !important;
    line-height: 18px !important;
  }

  /* Table Values (15px, 400, #D8D8D8, 22px) */
  /* Right side of Businesses */
  .dark .text-right .flex-col span.text-kite-text:not(.text-kite-green):not(.text-kite-red):not(.text-\\[\\#FF5722\\]):not(.text-\\[\\#4CAF50\\]),
  /* Right side of Investments desktop */
  .dark .hidden.md\\:flex .text-right span:not(.text-kite-green):not(.text-kite-red):not(.text-\\[\\#FF5722\\]):not(.text-\\[\\#4CAF50\\]),
  /* Tables */
  .dark td:not(:first-child) span:not(.text-kite-green):not(.text-kite-red):not(.text-\\[\\#FF5722\\]):not(.text-\\[\\#4CAF50\\]),
  .dark td:not(:first-child) div:not(.text-kite-green):not(.text-kite-red):not(.text-\\[\\#FF5722\\]):not(.text-\\[\\#4CAF50\\]),
  .dark td:not(:first-child) p:not(.text-kite-green):not(.text-kite-red):not(.text-\\[\\#FF5722\\]):not(.text-\\[\\#4CAF50\\]) {
    font-size: 15px !important;
    font-weight: 400 !important;
    color: #D8D8D8 !important;
    line-height: 22px !important;
  }
  
  /* Sidebar Company (15px, 400, #D8D8D8, 22px) */
  .dark .w-3\\/12 .uppercase:not(.text-kite-text-light):not(.text-kite-text),
  /* Investor list in Investors.tsx */
  .dark .flex-1 .uppercase:not(.text-kite-text) {
    font-size: 15px !important;
    font-weight: 400 !important;
    color: #D8D8D8 !important;
    line-height: 22px !important;
  }

  /* Profit / Loss & Sidebar % (15px, 500, #4CAF50 / #EF5350, 22px) */
  .dark .text-\\[\\#4CAF50\\],
  .dark .text-kite-green,
  .dark .text-green-500 {
    font-size: 15px !important;
    font-weight: 500 !important;
    color: #4CAF50 !important;
    line-height: 22px !important;
  }
  .dark .text-\\[\\#EF5350\\],
  .dark .text-\\[\\#FF5722\\],
  .dark .text-\\[\\#D94B4B\\],
  .dark .text-kite-red,
  .dark .text-red-500 {
    font-size: 15px !important;
    font-weight: 500 !important;
    color: #EF5350 !important;
    line-height: 22px !important;
  }
  
  /* Required/ROI labels in Businesses row */
  .dark .text-right .flex-col span.text-kite-text-light {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: #BDBDBD !important;
    line-height: 20px !important;
  }

  /* Search Placeholder (14px, 400, #7A7A7A, 20px) */
  .dark input::placeholder,
  .dark textarea::placeholder {
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #7A7A7A !important;
    line-height: 20px !important;
  }

  /* Top Navigation (14px, 400, #BDBDBD, 20px) */
  .dark header nav button span {
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #BDBDBD !important;
    line-height: 20px !important;
  }

  /* Active Navigation (14px, 500, #E3E3E3, 20px) */
  .dark header nav button.border-kite-blue span,
  .dark header nav button.text-kite-blue span,
  .dark header nav button.lg\\:border-\\[\\#FF6D2D\\] span,
  .dark header nav button.lg\\:text-\\[\\#FF6D2D\\] span {
    font-weight: 500 !important;
    color: #E3E3E3 !important;
  }
}
/* --- END USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- */
`

let content = fs.readFileSync('src/index.css', 'utf8');

// Replace everything between the markers, or append if not found
const startMarker = "/* --- USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- */";
const endMarker = "/* --- END USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- */";

if (content.includes(startMarker)) {
  // If we only have the start marker from last time, replace from there to the end
  if (content.includes(endMarker)) {
    const regex = new RegExp("\\/\\* --- USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- \\*\\/[\\s\\S]*?\\/\\* --- END USER REQUESTED TYPOGRAPHY FOR DESKTOP DARK MODE --- \\*\\/");
    content = content.replace(regex, cssToAdd.trim());
  } else {
    // Old version didn't have end marker. Let's just slice it out.
    const parts = content.split(startMarker);
    content = parts[0] + "\n" + cssToAdd.trim();
  }
} else {
  content += "\n" + cssToAdd.trim();
}

fs.writeFileSync('src/index.css', content);
console.log("Patched CSS typography");
