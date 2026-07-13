const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

const regex = /\{selectedPreviewInvestor\s*&&\s*\(\s*<div\s*className="fixed inset-0 z-\[100\].*?<\/div>\s*\)\}/s;

const newModalBlock = `{selectedPreviewInvestor && (
        <InvestorPreviewModal
          investor={selectedPreviewInvestor}
          onClose={() => setSelectedPreviewInvestor(null)}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setSelectedPreviewInvestor(data);
            }
          }}
        />
      )}`;

content = content.replace(regex, newModalBlock);
fs.writeFileSync('src/pages/Investors.tsx', content);
