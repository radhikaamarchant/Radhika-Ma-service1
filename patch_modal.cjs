const fs = require('fs');
let content = fs.readFileSync('src/components/ImageCropModal.tsx', 'utf8');

content = content.replace(
  /<div className="fixed inset-0 z-\[100\] bg-black flex flex-col">[\s\S]*<\/div>\s*<\/div>\s*\);\s*\}/,
  `<div className="fixed inset-0 z-[100] bg-black md:bg-black/80 flex flex-col md:items-center md:justify-center md:p-8">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex justify-between items-center p-4 bg-black text-white mobile-modal-safe w-full shrink-0">
        <button onClick={onClose} className="px-3 py-1 font-normal text-[15px]">Cancel</button>
        <span className="font-normal text-[16px]">Crop Image</span>
        <button onClick={handleSave} className="px-3 py-1 text-kite-blue font-medium text-[15px]">Done</button>
      </div>

      {/* Desktop Modal Container */}
      <div className="flex-1 md:flex-initial md:bg-white md:dark:bg-kite-surface md:rounded-lg md:overflow-hidden md:flex md:flex-col md:w-full md:max-w-2xl md:shadow-2xl flex flex-col w-full h-full md:h-auto md:max-h-[80vh]">
        {/* Desktop Header (Hidden on Mobile) */}
        <div className="hidden md:flex justify-between items-center p-4 border-b border-kite-border bg-white dark:bg-kite-surface text-kite-text shrink-0">
          <span className="font-medium text-[16px]">Crop Image</span>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-1.5 font-medium text-kite-text-light hover:bg-gray-100 dark:hover:bg-[#202020] rounded transition-colors text-[14px]">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-[#4184F3] hover:bg-[#387ED1] text-white font-medium rounded transition-colors text-[14px]">
              Save
            </button>
          </div>
        </div>
        
        {/* Crop Area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-black md:bg-gray-900 md:dark:bg-black p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageUrl}
              onLoad={onImageLoad}
              style={{ maxHeight: "70vh", maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/components/ImageCropModal.tsx', content);
console.log("Patched ImageCropModal.tsx");
