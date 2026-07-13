const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

// 1. Add missing imports
if (!content.includes('Landmark')) {
  content = content.replace(
    '  Building2,',
    '  Building2,\n  Landmark,\n  ChevronDown,'
  );
}

// 2. Add isBankDetailsExpanded state
if (!content.includes('isBankDetailsExpanded')) {
  content = content.replace(
    'const [isEditingDetails, setIsEditingDetails] = useState(false);',
    'const [isEditingDetails, setIsEditingDetails] = useState(false);\n  const [isBankDetailsExpanded, setIsBankDetailsExpanded] = useState(false);'
  );
}

// 3. Update main container class (max-w-4xl mx-auto -> w-full)
content = content.replace(
  'className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto"',
  'className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 w-full"'
);

// 4. Update Edit Details button size
content = content.replace(
  'className="flex-1 bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[13px] md:text-[14px] px-4 py-3 sm:py-2.5 rounded-sm shadow-sm transition-all flex items-center justify-center space-x-2"',
  'className="w-full sm:w-auto sm:ml-auto bg-white dark:bg-kite-surface text-kite-text border border-kite-border hover:bg-kite-bg font-medium text-[12px] md:text-[13px] px-3 py-2 rounded-sm shadow-sm transition-all flex items-center justify-center space-x-1.5"'
);
content = content.replace(
  '<Edit2 className="w-4 h-4" /> <span>Edit Details</span>',
  '<Edit2 className="w-3.5 h-3.5" /> <span>Edit Details</span>'
);

// 5. Update Bank Profile to be collapsible and change icon
const bankProfileOriginal = `<div className="bg-white dark:bg-kite-surface border border-kite-border rounded p-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-kite-border">
              <Building2 className="w-4 h-4 text-kite-text-light" />
              <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                Bank Profile
              </h3>
            </div>
            {""}
            {investor.bankDetails ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Bank Name
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                    {investor.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Account No.
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                    {investor.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    IFSC Code
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                    {investor.bankDetails.ifscCode}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                    Holder Name
                  </p>
                  <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                    {investor.bankDetails.accountHolderName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] md:text-[14px] text-kite-text-light py-2">
                No bank details added.
              </p>
            )}
            {""}
          </div>`;

const bankProfileReplacement = `<div className="bg-white dark:bg-kite-surface border border-kite-border rounded overflow-hidden">
            <div 
              className={\`flex items-center justify-between p-4 cursor-pointer hover:bg-kite-bg transition-colors \${isBankDetailsExpanded ? 'border-b border-kite-border' : ''}\`}
              onClick={() => setIsBankDetailsExpanded(!isBankDetailsExpanded)}
            >
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-kite-text-light" />
                <h3 className="text-[13px] md:text-[14px] font-medium text-kite-text">
                  Bank details
                </h3>
              </div>
              {isBankDetailsExpanded ? (
                <ChevronDown className="w-4 h-4 text-kite-text-light" />
              ) : (
                <ChevronRight className="w-4 h-4 text-kite-text-light" />
              )}
            </div>
            {""}
            {isBankDetailsExpanded && (
              <div className="p-4">
                {investor.bankDetails ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Bank Name
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                        {investor.bankDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Account No.
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                        {investor.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        IFSC Code
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium font-mono text-kite-text mt-0.5">
                        {investor.bankDetails.ifscCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-kite-text-light uppercase">
                        Holder Name
                      </p>
                      <p className="text-[13px] md:text-[14px] font-medium text-kite-text mt-0.5">
                        {investor.bankDetails.accountHolderName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] md:text-[14px] text-kite-text-light py-2">
                    No bank details added.
                  </p>
                )}
              </div>
            )}
            {""}
          </div>`;

content = content.replace(bankProfileOriginal, bankProfileReplacement);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
