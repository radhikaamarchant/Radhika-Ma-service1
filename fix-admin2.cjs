const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// 1. Update the outer container for mobile
content = content.replace(
  '<div className="flex-1 bg-kite-bg h-full p-4 md:p-8 overflow-y-auto animate-fade-in relative font-sans">',
  '<div className="flex-1 bg-[#f4f4f4] md:bg-kite-bg h-full p-0 md:p-8 overflow-y-auto animate-fade-in relative font-sans">'
);

content = content.replace(
  '<div className="max-w-3xl mx-auto space-y-6">',
  '<div className="max-w-3xl mx-auto space-y-2 md:space-y-6">'
);

// 2. Hide the main title on mobile, since mobile has its own header
content = content.replace(
  '<div className="flex justify-between items-end mb-8 border-b border-kite-border pb-4">',
  '<div className="hidden md:flex justify-between items-end mb-8 border-b border-kite-border pb-4">'
);

// 3. Update the main profile card container
content = content.replace(
  '<div className="bg-white rounded-sm border border-kite-border p-6 shadow-sm">',
  '<div className="bg-white md:rounded-sm border-b md:border border-gray-200 md:border-kite-border px-4 py-6 md:p-6 md:shadow-sm">'
);

// 4. Update the Financial Statement card container
content = content.replace(
  '<div className="bg-white rounded-sm border border-kite-border p-6 shadow-sm">',
  '<div className="bg-white md:rounded-sm border-y md:border border-gray-200 md:border-kite-border px-4 py-6 md:p-6 md:shadow-sm mt-2 md:mt-0">'
);

// 5. Enhance Profile Photo + Name display (Kite style centered)
content = content.replace(
  '<div className="flex flex-col md:flex-row gap-8 items-start">',
  '<div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">'
);

// Photo section size tweaks for mobile
content = content.replace(
  '<div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex flex-col items-center justify-center relative group">',
  '<div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative group shadow-sm">'
);

// Details Section
content = content.replace(
  '<div className="space-y-6">',
  '<div className="space-y-6 w-full">'
);

// Name section: replace the existing name display to be centered on mobile
content = content.replace(
  /<div>\s*<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Admin Name<\/h3>\s*<div className="flex items-center gap-2">\s*<p className="text-2xl font-bold text-kite-text tracking-tight">\{profile\.name\}<\/p>\s*<BadgeCheck className="w-6 h-6 text-blue-500" \/>\s*<\/div>\s*<\/div>/g,
  `<div className="text-center md:text-left">
    <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
      <p className="text-xl md:text-2xl font-medium text-gray-800 tracking-tight">{profile.name}</p>
      <BadgeCheck className="w-5 h-5 text-blue-500" />
    </div>
    <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Name</h3>
  </div>`
);

// Address
content = content.replace(
  /<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Office \/ Home Address<\/h3>/g,
  '<h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 md:mb-2">Office / Home Address</h3>'
);

// Address text
content = content.replace(
  /<p className="text-base text-kite-text whitespace-pre-wrap leading-relaxed">\{profile\.address\}<\/p>/g,
  '<p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.address}</p>'
);

// Bank section
content = content.replace(
  /<div className="pt-6 border-t border-gray-100">/g,
  '<div className="pt-5 md:pt-6 border-t border-gray-100">'
);

content = content.replace(
  /<h3 className="text-sm font-bold text-kite-text tracking-tight mb-4 flex items-center">/g,
  '<h3 className="text-[13px] md:text-sm font-medium text-gray-800 tracking-tight mb-3 md:mb-4 flex items-center">'
);

// Inside the Bank grid
content = content.replace(
  /<p className="text-\[10px\] font-semibold uppercase tracking-wider text-gray-500 mb-1">/g,
  '<p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5 md:mb-1">'
);

content = content.replace(
  /<p className="text-sm font-medium text-kite-text">/g,
  '<p className="text-[13px] md:text-sm font-medium text-gray-800">'
);
content = content.replace(
  /<p className="text-sm font-mono text-kite-text">/g,
  '<p className="text-[13px] md:text-sm font-mono text-gray-800">'
);

// Edit button for mobile (Kite profile has a small edit icon or button)
// We'll just ensure the edit button is visible on mobile. Currently it's in the hidden header.
// Let's add a floating edit button or just a simple edit button below the profile info if not editing.
// Or we can add it inside the profile card at the top right.

content = content.replace(
  '<div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">',
  `{/* Mobile Edit Button */}
  {!isEditing && (
    <div className="md:hidden flex justify-end w-full -mb-8 relative z-10">
      <button onClick={() => setIsEditing(true)} className="text-blue-500 text-sm font-medium">Edit</button>
    </div>
  )}
  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">`
);

fs.writeFileSync('src/pages/AdminPage.tsx', content);
console.log("Done");
