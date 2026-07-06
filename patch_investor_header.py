import re

with open('src/components/InvestorDetail.tsx', 'r') as f:
    content = f.read()

target = """      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          {" "}
          <ArrowLeft className="w-5 h-5" />{" "}
        </button>
        <div className="flex flex-col">
          <h2 className="text-[15px] md:text-[16px] md:text-[16px] font-medium text-kite-text">
            {investor.name?.toUpperCase()}
          </h2>
          <span
            className="text-[11px] md:text-[12px] text-kite-text-light tracking-wide"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            #{investor.investorId}
          </span>
        </div>
      </div>"""

replacement = """      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            {" "}
            <ArrowLeft className="w-5 h-5" />{" "}
          </button>
          
          <div className="relative cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-kite-blue/10 dark:bg-kite-blue/20 text-kite-blue flex items-center justify-center overflow-hidden border border-kite-border-soft relative group">
              {investor.photoUrl ? (
                <img src={investor.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl md:text-2xl font-normal">{(investor.shortName || investor.name)?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-[15px] md:text-[16px] font-medium text-kite-text">
              {investor.name?.toUpperCase()}
            </h2>
            <span
              className="text-[11px] md:text-[12px] text-kite-text-light tracking-wide"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              #{investor.investorId}
            </span>
          </div>
        </div>
      </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced successfully")
else:
    print("Target not found!")

with open('src/components/InvestorDetail.tsx', 'w') as f:
    f.write(content)

