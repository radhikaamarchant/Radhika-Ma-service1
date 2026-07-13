const fs = require('fs');
let content = fs.readFileSync('src/pages/Investors.tsx', 'utf-8');

// The new correct block
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
      )}
    </div>
  );
}`;

// Find where `{selectedPreviewInvestor && (` starts.
const startIndex = content.indexOf('{selectedPreviewInvestor && (');

// Find the end of the `export default function Investors() { ... }` which is marked by `  );\n}` before the `PdfContent` component.
// We can just find the `PdfContent` component and replace everything from startIndex to right before `PdfContent`.
const pdfContentIndex = content.indexOf('// Sub-component for the PDF Content');

if (startIndex !== -1 && pdfContentIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(pdfContentIndex);
    fs.writeFileSync('src/pages/Investors.tsx', before + newModalBlock + '\n\n' + after);
}

