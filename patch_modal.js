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
        </button>
        
        <div className="w-full p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start space-x-4 md:space-x-5 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border border-kite-border-soft bg-kite-blue/10 dark:bg-kite-blue/20 flex items-center justify-center text-kite-blue">
                 {business.photoUrl ? (
                   <img src={business.photoUrl} className="w-full h-full object-cover" alt={business.name} />
                 ) : (
                   <span className="text-3xl font-normal">{(business.shortName || business.name)?.substring(0, 2).toUpperCase()}</span>
                 )}
              </div>
              <div className="pt-2">
                <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1 leading-tight">{business.name?.toUpperCase()}</h2>`,
  `      <div className="relative w-full max-w-4xl bg-white dark:bg-kite-bg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full z-[101]"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="w-full p-6 md:p-8 overflow-y-auto bg-white dark:bg-kite-bg flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start space-x-4 md:space-x-5 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border border-kite-border-soft bg-kite-blue/10 dark:bg-kite-blue/20 flex items-center justify-center text-kite-blue">
                 {business.photoUrl ? (
                   <img src={business.photoUrl} className="w-full h-full object-cover" alt={business.name} />
                 ) : (
                   <span className="text-3xl font-normal">{(business.shortName || business.name)?.substring(0, 2).toUpperCase()}</span>
                 )}
              </div>
              <div className="pt-2 pr-8 md:pr-0">
                <h2 className="text-[18px] md:text-[22px] font-medium text-kite-text mb-1 leading-tight">{business.name?.toUpperCase()}</h2>`
);

fs.writeFileSync('src/components/BusinessPreviewModal.tsx', code);
