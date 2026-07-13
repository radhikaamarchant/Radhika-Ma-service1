const fs = require('fs');

let content = fs.readFileSync('src/components/InvestorDetail.tsx', 'utf-8');

if (!content.includes('const [previewHistory, setPreviewHistory]')) {
    content = content.replace(
        'const [selectedPreviewInvestor, setSelectedPreviewInvestor] = useState<Investor | null>(null);',
        'const [selectedPreviewInvestor, setSelectedPreviewInvestor] = useState<Investor | null>(null);\n  const [previewHistory, setPreviewHistory] = useState<Investor[]>([]);'
    );
}

// Replace the BioRenderer block where it's first triggered
const oldBioRender = `<BioRenderer 
                  bio={investor.bio} 
                  onMentionClick={(type, id, data) => {
                    if (type === 'investor') {
                      setSelectedPreviewInvestor(data);
                    }
                  }} 
                />`;

const newBioRender = `<BioRenderer 
                  bio={investor.bio} 
                  onMentionClick={(type, id, data) => {
                    if (type === 'investor') {
                      setPreviewHistory([data]);
                      setSelectedPreviewInvestor(data);
                    }
                  }} 
                />`;

content = content.replace(oldBioRender, newBioRender);

// Replace InvestorPreviewModal block
const oldModalStr = `<InvestorPreviewModal
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
            }
          }}
        />`;

content = content.replace(oldModalStr, newModalStr);

fs.writeFileSync('src/components/InvestorDetail.tsx', content);
