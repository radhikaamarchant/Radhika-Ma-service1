const fs = require('fs');
let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

// Add selectedPreviewBusiness state
if (!content.includes('selectedPreviewBusiness')) {
    content = content.replace(
        'const [previewHistory, setPreviewHistory] = useState<Investor[]>([]);',
        'const [previewHistory, setPreviewHistory] = useState<Investor[]>([]);\n  const [selectedPreviewBusiness, setSelectedPreviewBusiness] = useState<Business | null>(null);\n  const [previewBusinessHistory, setPreviewBusinessHistory] = useState<Business[]>([]);'
    );
}

// Update BioRenderer mention click handling
content = content.replace(
    /onMentionClick=\{\(type, id, data\) => \{\n\s*if \(type === 'investor'\) \{\n\s*setPreviewHistory\(\[data\]\);\n\s*setSelectedPreviewInvestor\(data\);\n\s*\}\n\s*\}\}/,
    `onMentionClick={(type, id, data) => {
                    if (type === 'investor') {
                      setPreviewHistory([data]);
                      setSelectedPreviewInvestor(data);
                    } else if (type === 'business') {
                      setPreviewBusinessHistory([data]);
                      setSelectedPreviewBusiness(data);
                    }
                  }}`
);

// Add BusinessPreviewModal import
if (!content.includes('BusinessPreviewModal')) {
    content = content.replace(
        "import InvestorPreviewModal from './InvestorPreviewModal';",
        "import InvestorPreviewModal from './InvestorPreviewModal';\nimport BusinessPreviewModal from './BusinessPreviewModal';"
    );
}

// Add BusinessPreviewModal JSX alongside InvestorPreviewModal
const oldModalStr = `<InvestorPreviewModal
          investor={selectedPreviewInvestor}
          onClose={() => {
            setPreviewHistory(prev => {
              if (prev.length <= 1) {
                setSelectedPreviewInvestor(null);
                return [];
              }
              const newHistory = prev.slice(0, -1);
              setSelectedPreviewInvestor(newHistory[newHistory.length - 1]);
              return newHistory;
            });
          }}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setPreviewHistory(prev => [...prev, data]);
              setSelectedPreviewInvestor(data);
            }
          }}
        />`;

const newModalStr = `<InvestorPreviewModal
          investor={selectedPreviewInvestor}
          onClose={() => {
            setPreviewHistory(prev => {
              if (prev.length <= 1) {
                setSelectedPreviewInvestor(null);
                return [];
              }
              const newHistory = prev.slice(0, -1);
              setSelectedPreviewInvestor(newHistory[newHistory.length - 1]);
              return newHistory;
            });
          }}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setPreviewHistory(prev => [...prev, data]);
              setSelectedPreviewInvestor(data);
            } else if (type === 'business') {
              setPreviewBusinessHistory(prev => [...prev, data]);
              setSelectedPreviewBusiness(data);
            }
          }}
        />
        {selectedPreviewBusiness && (
        <BusinessPreviewModal
          business={selectedPreviewBusiness}
          onClose={() => {
            setPreviewBusinessHistory(prev => {
              if (prev.length <= 1) {
                setSelectedPreviewBusiness(null);
                return [];
              }
              const newHistory = prev.slice(0, -1);
              setSelectedPreviewBusiness(newHistory[newHistory.length - 1]);
              return newHistory;
            });
          }}
          businesses={state.businesses}
          investors={state.investors}
          investments={state.investments}
          settings={state.settings}
          onMentionClick={(type, id, data) => {
            if (type === 'investor') {
              setPreviewHistory(prev => [...prev, data]);
              setSelectedPreviewInvestor(data);
            } else if (type === 'business') {
              setPreviewBusinessHistory(prev => [...prev, data]);
              setSelectedPreviewBusiness(data);
            }
          }}
        />
        )}`;

content = content.replace(oldModalStr, newModalStr);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
