import fs from 'fs';

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf8');

content = content.replace(
  'const [isEditingDetails, setIsEditingDetails] = useState(false);',
  'const [isEditingDetails, setIsEditingDetails] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);'
);

content = content.replace(
  `  const handleDeleteInvestor = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this investor?",
      )
    ) {
      dispatch({ type: "DELETE_INVESTOR", payload: investorId });
      onBack();
    }
  };`,
  `  const handleDeleteInvestor = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteInvestor = () => {
    dispatch({ type: "DELETE_INVESTOR", payload: investorId });
    setShowDeleteConfirm(false);
    onBack();
  };`
);

const modalCode = `
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white dark:bg-kite-bg p-6 rounded-md max-w-sm w-full">
            <h3 className="text-[16px] font-medium text-kite-text mb-2">Delete Investor</h3>
            <p className="text-[14px] text-kite-text-light mb-6">Are you sure you want to permanently delete this investor and all of their investments? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[13px] font-medium text-kite-text border border-kite-border rounded-sm hover:bg-kite-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvestor}
                className="px-4 py-2 text-[13px] font-medium text-white bg-kite-red rounded-sm hover:bg-opacity-90 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  'return (\n    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto">',
  'return (\n    <div className="space-y-4 md:space-y-6 animate-slide-in-mobile pb-20 pt-8 md:pt-0 px-3 md:px-0 max-w-4xl mx-auto">' + modalCode
);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
console.log("Success InvestorDetail patch");
