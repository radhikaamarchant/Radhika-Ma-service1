const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

const originalHeader = `<div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            {" "}
            <ArrowLeft className="w-5 h-5" />{" "}
          </button>
          
          <div className="relative shrink-0">`;

const newHeader = `<div className="flex items-start space-x-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 mt-2 md:mt-4 text-gray-500 hover:text-kite-text transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            {" "}
            <ArrowLeft className="w-5 h-5" />{" "}
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className="relative shrink-0">`;

const originalText = `<div className="flex flex-col">
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
            {investor.bio && (
              <p className="mt-3 text-[12px] md:text-[13px] text-kite-text whitespace-pre-wrap leading-relaxed">
                {investor.bio}
              </p>
            )}
            {investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
              <div className="mt-3 text-[11px] md:text-[12px] text-kite-text-light flex flex-col space-y-0.5">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            )}
          </div>`;

const newText = `<div className="flex flex-col">
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
            
            {investor.bio && (
              <p className="mt-4 text-[12px] md:text-[13px] text-kite-text whitespace-pre-wrap leading-relaxed max-w-2xl">
                {investor.bio}
              </p>
            )}
            {investor.address && (investor.address.flatHouse || investor.address.residentHouseName || investor.address.landmark || investor.address.city || investor.address.state) && (
              <div className="mt-3 text-[11px] md:text-[12px] text-kite-text-light flex flex-col space-y-0.5">
                {investor.address.flatHouse && <p>{investor.address.flatHouse}</p>}
                {investor.address.residentHouseName && <p>{investor.address.residentHouseName}</p>}
                {investor.address.landmark && <p>{investor.address.landmark}</p>}
                {(investor.address.city || investor.address.state) && (
                  <p>
                    {investor.address.city}{investor.address.city && investor.address.state ? ', ' : ''}{investor.address.state}
                  </p>
                )}
              </div>
            )}
          </div>`;

content = content.replace(originalHeader, newHeader);
content = content.replace(originalText, newText);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
