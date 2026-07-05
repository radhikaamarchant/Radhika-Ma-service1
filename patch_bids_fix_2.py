import re

with open('src/pages/Bids.tsx', 'r') as f:
    content = f.read()

# I will find "isDetailsOpen" and rewrite that block.
start_idx = content.find('{isDetailsOpen && selectedIpo && (')
end_idx = content.find('  const { state } = useAppContext();', start_idx)

if start_idx != -1 and end_idx != -1:
    new_block = '''{isDetailsOpen && selectedIpo && (
        <DetailsModal ipo={selectedIpo} onClose={() => setIsDetailsOpen(false)} onApply={() => { setIsDetailsOpen(false); setIsApplyOpen(true); }} applications={applications} saveApplications={saveApplications} commissions={commissions} saveCommissions={saveCommissions} />
      )}
      
      {isApplyOpen && selectedIpo && (
        <ApplyModal 
          ipo={selectedIpo} 
          onClose={() => setIsApplyOpen(false)} 
          applications={applications}
          saveApplications={saveApplications}
          commissions={commissions}
          saveCommissions={saveCommissions}
        />
      )}
    </div>
  );
}

function AdminBidsView({ ipos, saveIpos, commissions, saveCommissions, applications, saveApplications, onClose }: any) {
'''
    
    content = content[:start_idx] + new_block + content[end_idx:]

with open('src/pages/Bids.tsx', 'w') as f:
    f.write(content)
