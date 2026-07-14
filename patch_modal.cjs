const fs = require('fs');

let code = fs.readFileSync('src/components/BusinessPreviewModal.tsx', 'utf-8');

code = code.replace(
  `      <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>`,
  `      <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>`
);

code = code.replace(
  `              </div>
              <div className="pt-2">
                <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1 leading-tight">{business.name?.toUpperCase()}</h2>`,
  `              </div>
              <div className="pt-2 pr-8 md:pr-0">
                <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1 leading-tight">{business.name?.toUpperCase()}</h2>`
);

fs.writeFileSync('src/components/BusinessPreviewModal.tsx', code);
