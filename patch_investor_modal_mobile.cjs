const fs = require('fs');

let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// The modal container
const oldModalContainer = `<div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>`;
const newModalContainer = `<div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>`;

// The image container
const oldImageContainer = `<div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center h-[40vh] md:h-auto md:min-h-0 relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">`;
const newImageContainer = `<div className="w-full md:w-1/2 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center min-h-[300px] md:min-h-0 md:h-auto relative shrink-0 border-b md:border-b-0 md:border-r border-kite-border">`;

// The image itself
const oldImage = `<img
                  src={selectedPreviewInvestor.photoUrl}
                  alt={selectedPreviewInvestor.name}
                  className="w-full h-full object-cover absolute inset-0"
                />`;
const newImage = `<img
                  src={selectedPreviewInvestor.photoUrl}
                  alt={selectedPreviewInvestor.name}
                  className="w-full h-full object-contain absolute inset-0 p-2 md:p-0"
                />`;


// The backdrop wrapper (to add pb-20 on mobile to avoid bottom nav)
const oldBackdrop = `<div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPreviewInvestor(null);
          }}
        >`;
const newBackdrop = `<div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-20 md:p-8 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPreviewInvestor(null);
          }}
        >`;

content = content.replace(oldModalContainer, newModalContainer);
content = content.replace(oldImageContainer, newImageContainer);
content = content.replace(oldImage, newImage);
content = content.replace(oldBackdrop, newBackdrop);

fs.writeFileSync('src/pages/Investors.tsx', content);
