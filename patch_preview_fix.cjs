const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

const previewModal = `
      {showPhotoPreview && investor.photoUrl && (
        <div className="fixed inset-0 z-[110] bg-black md:bg-black/80 flex flex-col md:items-center md:justify-center md:p-8">
          <div className="flex justify-between items-center p-4 bg-black text-white mobile-modal-safe w-full shrink-0 md:hidden">
            <span className="font-medium text-[16px]">Profile Photo</span>
            <button onClick={() => setShowPhotoPreview(false)} className="px-3 py-1 font-normal text-[15px]">Close</button>
          </div>
          
          <div className="flex-1 md:flex-initial md:bg-white md:dark:bg-kite-surface md:rounded-lg md:overflow-hidden md:flex md:flex-col md:w-full md:max-w-xl md:shadow-2xl flex flex-col w-full h-full md:h-auto">
            <div className="hidden md:flex justify-between items-center p-4 border-b border-kite-border bg-white dark:bg-kite-surface text-kite-text shrink-0">
              <span className="font-medium text-[16px]">Profile Photo</span>
              <button onClick={() => setShowPhotoPreview(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#202020] rounded-full transition-colors">
                <X className="w-5 h-5 text-kite-text-light" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-black md:bg-gray-100 md:dark:bg-black p-0 md:p-8 relative">
              <img src={investor.photoUrl} alt="Profile Preview" className="w-full h-auto max-h-[80vh] md:max-h-[60vh] object-contain" />
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/\s*<\/div>\s*\);\s*\}/, previewModal + "\n    </div>\n  );\n}");

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
console.log("Patched preview fix");
