const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessDetail.tsx', 'utf8');

const targetState = `  const [isSavingSahay, setIsSavingSahay] = useState(false);`;
const injectState = `  const [isSavingSahay, setIsSavingSahay] = useState(false);
  const [showHpgPdf, setShowHpgPdf] = useState(false);`;

code = code.replace(targetState, injectState);

const targetHpg = `          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Investors</p>
              <p className="text-[20px] font-normal text-kite-blue">{hpgStats.investors}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Profit</p>
              <p className="text-[20px] font-normal text-[#4CAF50]">{formatINR(hpgStats.totalProfit)}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">Total Loss</p>
              <p className="text-[20px] font-normal text-[#DF514C]">{formatINR(hpgStats.totalLoss)}</p>
            </div>
            <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border p-4 text-center">
              <p className="text-[12px] text-kite-text-light uppercase tracking-wide mb-1">High Profit</p>
              <p className="text-[20px] font-normal text-kite-blue">{formatINR(hpgStats.highProfit)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-kite-surface rounded shadow-sm border border-kite-border flex-1 flex flex-col overflow-hidden">
            <h2 className="text-[15px] font-medium text-kite-text p-4 border-b border-kite-border">{business.name} Deta list</h2>
            <div className="overflow-auto p-4 space-y-3">
              {hpgStats.details.length === 0 ? (
                <div className="text-center text-kite-text-light text-[13px] py-10">No detailed statements available.</div>
              ) : (
                hpgStats.details.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-kite-border-soft pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[14px] font-medium text-kite-text">{item.investorName}</p>
                      <p className="text-[12px] text-kite-text-light">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={\`text-[14px] font-medium \${item.netProfit >= 0 ? "text-[#4CAF50]" : "text-[#DF514C]"}\`}>
                        {item.netProfit >= 0 ? "+" : ""}{formatINR(item.netProfit)}
                      </p>
                      <p className="text-[12px] text-kite-text-light">Net P&L</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>`;

const injectHpg = `          <button
            onClick={() => setShowHpgPdf(true)}
            className="w-full bg-white dark:bg-kite-surface border border-kite-border text-kite-blue dark:text-kite-blue px-5 py-3 rounded text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-kite-bg transition-colors uppercase tracking-wide"
          >
            Check Details
          </button>`;

code = code.replace(targetHpg, injectHpg);

const targetPdfPortal = `      {showStatement && createPortal(`;

const injectPdfPortal = `      {showHpgPdf && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-3xl max-h-[90vh] flex flex-col relative rounded shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t">
              <h3 className="text-[16px] font-medium text-black">HPG સહાય કેન્દ્ર - રિપોર્ટ</h3>
              <button onClick={() => setShowHpgPdf(false)} className="text-gray-500 hover:text-black transition-colors text-[24px] leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="text-center mb-8">
                <h1 className="text-[22px] font-bold text-black mb-2">{business.name}</h1>
                <p className="text-[14px] text-gray-600">સહાય સબસિડી ડેટા લિસ્ટ</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ રોકાણકારો</p>
                  <p className="text-[20px] font-medium text-black">{hpgStats.investors}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ નફો</p>
                  <p className="text-[20px] font-medium text-green-600">₹{formatINR(hpgStats.totalProfit).replace("₹", "")}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">કુલ નુકસાન</p>
                  <p className="text-[20px] font-medium text-red-600">₹{formatINR(hpgStats.totalLoss).replace("₹", "")}</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-1">વધુ નફો</p>
                  <p className="text-[20px] font-medium text-blue-600">₹{formatINR(hpgStats.highProfit).replace("₹", "")}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-3">
                  <h2 className="text-[14px] font-medium text-black">{business.name} ડેટા લિસ્ટ</h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white">
                    <tr>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium">રોકાણકારનું નામ</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium">તારીખ</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-[12px] text-gray-500 font-medium text-right">ચોખ્ખો નફો/નુકસાન</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hpgStats.details.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-[13px] text-gray-500">કોઈ ડેટા ઉપલબ્ધ નથી</td>
                      </tr>
                    ) : (
                      hpgStats.details.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 border-b border-gray-100 text-[13px] text-black font-medium">{item.investorName}</td>
                          <td className="py-3 px-4 border-b border-gray-100 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString("gu-IN")}</td>
                          <td className={\`py-3 px-4 border-b border-gray-100 text-[13px] font-medium text-right \${item.netProfit >= 0 ? "text-green-600" : "text-red-600"}\`}>
                            {item.netProfit >= 0 ? "+" : "-"}₹{formatINR(Math.abs(item.netProfit)).replace("₹", "")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center rounded-b">
              <button onClick={() => setShowHpgPdf(false)} className="px-6 py-2 bg-gray-800 text-white rounded text-[13px] font-medium hover:bg-black transition-colors">બંધ કરો</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showStatement && createPortal(`;

code = code.replace(targetPdfPortal, injectPdfPortal);

fs.writeFileSync('src/components/BusinessDetail.tsx', code);
